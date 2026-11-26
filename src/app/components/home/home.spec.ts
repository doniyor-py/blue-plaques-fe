import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { Home } from './home';
import { testProviders } from '../../testing/test-providers';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let http: HttpTestingController;

  const dickens = {
    _id: 'p1', title: 'Charles Dickens blue plaque', borough: 'Camden', category: 'literature',
    inscription: 'Charles Dickens 1812-1870 novelist lived here', address: '48 Doughty Street, Camden, WC1',
    erected_year: 1903, people: [{ name: 'Charles Dickens', born: 1812, died: 1870 }], photos: [], visits: []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: testProviders
    })
    .compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  function answerStartingRequests() {
    http.expectOne(req => req.url.endsWith('/plaques') && req.params.get('ps') === '4')
      .flush({ total: 3375, pages: 844, page: 1, plaques: [dickens] });
    http.expectOne(req => req.url.endsWith('/boroughs')).flush(new Array(33).fill('B'));
    http.expectOne(req => req.url.endsWith('/plaques/search'))
      .flush({ total: 1, pages: 1, page: 1, plaques: [dickens] });
    fixture.detectChanges();
  }

  it('should show the counts, the featured plaque and the cards', () => {
    answerStartingRequests();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('.eyebrow')?.textContent).toContain('3,375 plaques · 33 London boroughs');
    expect(page.querySelector('.roundel-name')?.textContent).toContain('Charles Dickens');
    expect(page.querySelector('.roundel-years')?.textContent).toContain('1812–1870');
    expect(page.querySelector('.roundel-role')?.textContent).toContain('novelist lived here');
    expect(page.textContent).toContain('48 Doughty Street, Camden · Erected 1903');
    expect(page.querySelectorAll('app-plaque-card').length).toBe(1);
  });

  it('should link each category chip to the browse page', () => {
    const chips = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('a.chip'));
    expect(chips.map(chip => chip.getAttribute('href'))).toContain('/plaques?category=science-medicine');
    expect(chips.length).toBe(5);
  });

  it('should show a random plaque in the roundel after "Surprise me"', () => {
    answerStartingRequests();
    component.surpriseMe();
    http.expectOne(req => req.url.endsWith('/plaques/random'))
      .flush({ ...dickens, _id: 'p2', people: [{ name: 'Virginia Woolf' }], inscription: 'Virginia Woolf lived here' });
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.roundel-name')?.textContent).toContain('Virginia Woolf');
    expect(component.announcement).toBe('Showing Virginia Woolf');
  });

  it('should invite guests to sign up for Insights', () => {
    const band = (fixture.nativeElement as HTMLElement).querySelector('.insights-band') as HTMLElement;
    expect(band.textContent).toContain('Members only');
    expect(band.querySelector('a[href="/signup"]')?.textContent).toContain('Create a free account');
    expect(band.querySelector('.locked-preview')?.closest('[aria-hidden="true"]')).toBeTruthy();
  });

  it('should offer to try again when the cards fail to load', () => {
    http.expectOne(req => req.url.endsWith('/plaques') && req.params.get('ps') === '4')
      .flush({ error: 'down' }, { status: 500, statusText: 'Server error' });
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('[role="alert"]')?.textContent).toContain('Could not load the plaques');
    expect(page.querySelector('.load-error button')?.textContent).toContain('Try again');
  });
});
