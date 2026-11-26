import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import * as L from 'leaflet';

import { Nearby } from './nearby';
import { testProviders } from '../../testing/test-providers';
import { API_URL, ROUTING_URL } from '../../api';

describe('Nearby', () => {
  let component: Nearby;
  let fixture: ComponentFixture<Nearby>;
  let http: HttpTestingController;
  let getLocation: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nearby],
      providers: testProviders
    })
    .compileComponents();

    fixture = TestBed.createComponent(Nearby);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    getLocation = spyOn(navigator.geolocation, 'getCurrentPosition');
  });

  afterEach(() => http.verify());

  async function openMap(state: PermissionState | 'no api'): Promise<HTMLElement> {
    if (state === 'no api') {
      spyOn(navigator.permissions, 'query').and.rejectWith(new TypeError('Not supported'));
    } else {
      spyOn(navigator.permissions, 'query').and.resolveTo({ state } as PermissionStatus);
    }
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve));
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function answerNearby() {
    http.expectOne(r => r.url === API_URL + '/plaques/nearby').flush([]);
    fixture.detectChanges();
  }

  function nearMeButton(page: HTMLElement): HTMLButtonElement | undefined {
    return [...page.querySelectorAll('button')].find(b => b.textContent!.trim() === 'Show plaques near me');
  }

  it('should create', async () => {
    await openMap('prompt');
    answerNearby();
    expect(component).toBeTruthy();
  });

  it('does not ask for the location on opening, and offers a button instead', async () => {
    const page = await openMap('prompt');
    answerNearby();
    expect(getLocation).not.toHaveBeenCalled();

    nearMeButton(page)!.click();
    expect(getLocation).toHaveBeenCalled();
  });

  it('uses the location straight away when the user already allowed it', async () => {
    const page = await openMap('granted');
    expect(getLocation).toHaveBeenCalled();
    expect(nearMeButton(page)).toBeUndefined();
  });

  it('explains how to turn location on when it is blocked', async () => {
    const page = await openMap('denied');
    answerNearby();
    expect(getLocation).not.toHaveBeenCalled();
    expect(nearMeButton(page)).toBeUndefined();
    expect(page.textContent).toContain('allow location in your browser settings');
  });

  it('offers the button when the browser cannot say', async () => {
    const page = await openMap('no api');
    answerNearby();
    expect(getLocation).not.toHaveBeenCalled();
    expect(nearMeButton(page)).toBeDefined();
  });

  it('hides the button once the location is known', async () => {
    getLocation.and.callFake((success: PositionCallback) =>
      success({ coords: { latitude: 51.5, longitude: -0.12 } } as GeolocationPosition));
    const page = await openMap('prompt');
    answerNearby();

    nearMeButton(page)!.click();
    answerNearby();
    expect(nearMeButton(page)).toBeUndefined();
  });

  const near = [
    { _id: 'p1', title: 'Charles Dickens blue plaque', colour: 'blue', borough: 'Camden',
      location: { type: 'Point', coordinates: [-0.12, 51.5] }, distance_m: 400, walking_minutes: 6 },
    { _id: 'p2', title: 'Sydney Smith brown plaque', colour: 'brown', borough: 'Camden',
      location: { type: 'Point', coordinates: [-0.13, 51.51] }, distance_m: 1600, walking_minutes: 20 }
  ];

  it('keeps the list and the markers in step, with a letter on every marker', async () => {
    const page = await openMap('prompt');
    http.expectOne(r => r.url === API_URL + '/plaques/nearby').flush(near);
    fixture.detectChanges();

    const icons = [...page.querySelectorAll('.plaque-marker')].map(icon => icon.textContent);
    expect(icons).toEqual(['B', 'Br']);
    expect(page.querySelector('#row-p1')!.textContent).toContain('Charles Dickens');

    (page.querySelector('#row-p2') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(page.querySelector('#row-p2')!.getAttribute('aria-current')).toBe('true');
    expect(page.querySelector('.plaque-marker.selected')!.textContent).toBe('Br');

    component.markersById.get('p1')!.marker.fire('click');
    fixture.detectChanges();
    expect(page.querySelector('#row-p1')!.classList).toContain('selected');
    expect(page.querySelector('.plaque-marker.selected')!.textContent).toBe('B');
  });

  it('shows only plaques within a 15 minute walk when that chip is on', async () => {
    getLocation.and.callFake((success: PositionCallback) =>
      success({ coords: { latitude: 51.5, longitude: -0.12 } } as GeolocationPosition));
    const page = await openMap('granted');
    http.expectOne(r => r.url === API_URL + '/plaques/nearby').flush(near);
    fixture.detectChanges();

    expect(page.textContent).toContain('Location shared');
    const chip = [...page.querySelectorAll('button')].find(b => b.textContent!.includes('Within 15 min walk'))!;
    chip.click();
    fixture.detectChanges();
    expect(chip.getAttribute('aria-pressed')).toBe('true');
    expect(page.querySelectorAll('.plaque-row').length).toBe(1);
  });

  it('previews a route, and draws it only when the walk starts', async () => {
    const page = await openMap('prompt');
    http.expectOne(r => r.url === API_URL + '/plaques/nearby').flush(near);
    component.selectPlaque(near[0]);
    component.userLocation = L.latLng(51.51, -0.13);
    component.loadRoute();
    http.expectOne(ROUTING_URL).flush({ trip: {
      summary: { time: 360, length: 0.4 },
      legs: [{ shape: '', maneuvers: [{ instruction: 'Head north-west on St George\'s Road', length: 0.25 }] }]
    } });
    fixture.detectChanges();

    expect(page.querySelector('.place-card')!.textContent).toContain('Route preview');
    expect(page.querySelector('.route-time')!.textContent).toContain('6 mins');
    expect(page.querySelector('.steps')!.textContent).toContain('250 m');
    expect(component.routeLayer.getLayers().length).toBe(0);

    const start = [...page.querySelectorAll('button')].find(b => b.textContent!.includes('Start walking route'))!;
    component.routeLine = [[51.51, -0.13], [51.5, -0.12]];
    start.click();
    fixture.detectChanges();
    expect(component.routeLayer.getLayers().length).toBe(2);
    expect(page.textContent).toContain('The route is shown on the map.');
  });

  it('gives up on a walking route after 15 seconds', fakeAsync(() => {
    component.selected = { _id: 'p1', location: { type: 'Point', coordinates: [-0.12, 51.5] } };
    component.userLocation = L.latLng(51.51, -0.13);
    component.loadRoute();
    const request = http.expectOne(ROUTING_URL);

    tick(15000);
    expect(request.cancelled).toBeTrue();
    expect(component.error).toBe('Finding a route took too long. Please try again.');
    expect(component.routeLoading).toBeFalse();
  }));
});
