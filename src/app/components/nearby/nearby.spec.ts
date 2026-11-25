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
