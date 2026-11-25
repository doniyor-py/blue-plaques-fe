import { TestBed } from '@angular/core/testing';
import { formatDate } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { Plaque } from './plaque';
import { API_URL } from '../../api';

const userToken = 'header.' + btoa(JSON.stringify({
  username: 'user0', admin: false, exp: Math.floor(Date.now() / 1000) + 3600
})) + '.signature';

const today = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
const plaque = { _id: 'p1', title: 'Charles Dickens blue plaque', inscription: 'Charles Dickens lived here',
                 colour: 'blue', borough: 'Camden', views: 10, people: [] };
const someoneElsesVisit = { _id: 'v1', username: 'user3', date: '2026-11-10',
                            ratings: { history: 4, condition: 5, accessibility: 3 }, overall: 4, note: '' };

describe('Plaque page', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'plaques/:id', component: Plaque }])
      ]
    });
    harness = await RouterTestingHarness.create();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem('token');
  });

  function answerVisits(visits: object[]) {
    http.expectOne(r => r.url === API_URL + '/plaques/p1/visits' && r.method === 'GET')
      .flush({ total: visits.length, page: 1, pages: 1, visits });
  }

  async function openPlaque(loggedIn: boolean): Promise<HTMLElement> {
    if (loggedIn) {
      localStorage.setItem('token', userToken);
    }
    await harness.navigateByUrl('/plaques/p1', Plaque);
    if (loggedIn) {
      http.expectOne(API_URL + '/users/me').flush({ username: 'user0', favourites: [] });
    }
    http.expectOne(API_URL + '/plaques/p1').flush(plaque);
    answerVisits([someoneElsesVisit]);
    harness.detectChanges();
    http.expectOne(API_URL + '/plaques/p1/photos').flush([]);
    harness.detectChanges();
    return harness.routeNativeElement as HTMLElement;
  }

  function buttonCalled(page: HTMLElement, text: string): HTMLButtonElement {
    const button = [...page.querySelectorAll('button')].find(b => b.textContent!.trim() === text);
    if (!button) { throw new Error('No button called "' + text + '"'); }
    return button;
  }

  function checkIn(page: HTMLElement) {
    buttonCalled(page, "I've visited").click();
    const req = http.expectOne(r => r.url === API_URL + '/plaques/p1/visits' && r.method === 'POST');
    expect([...(req.request.body as FormData).keys()]).toEqual([]);
    req.flush({ _id: 'v9' }, { status: 201, statusText: 'Created' });
    answerVisits([{ _id: 'v9', username: 'user0', date: today, note: '' }, someoneElsesVisit]);
    harness.detectChanges();
  }

  it('shows the plaque and its visits', async () => {
    const page = await openPlaque(false);
    expect(page.querySelector('h1')!.textContent).toContain('Charles Dickens blue plaque');
    expect(page.querySelector('#visits-heading')!.textContent).toContain('Visits (1)');
  });

  it('sends a visitor who is not logged in to the login page', async () => {
    const page = await openPlaque(false);
    const link = [...page.querySelectorAll('a')].find(a => a.textContent!.trim() === "I've visited")!;
    expect(link.getAttribute('href')).toBe('/login?returnUrl=%2Fplaques%2Fp1');
  });

  it("\"I've visited\" saves a visit without a review and offers to rate it", async () => {
    const page = await openPlaque(true);
    checkIn(page);

    expect(page.textContent).toContain('Visit saved!');
    expect(buttonCalled(page, '✓ Visited today').disabled).toBeTrue();
    expect(page.querySelector('#visits-heading')!.textContent).toContain('Visits (2)');
  });

  it('will not save a review until all three ratings are chosen', async () => {
    const page = await openPlaque(true);
    checkIn(page);
    buttonCalled(page, 'Rate this plaque').click();
    harness.detectChanges();

    buttonCalled(page, 'Save review').click();
    harness.detectChanges();

    expect(page.textContent!.match(/Please choose from 1 to 5 stars/g)!.length).toBe(3);
    http.expectNone(r => r.method === 'PUT');
  });

  it('saves the chosen stars and the note', async () => {
    const page = await openPlaque(true);
    checkIn(page);
    buttonCalled(page, 'Rate this plaque').click();
    harness.detectChanges();

    (page.querySelector('label[for="history-4"]') as HTMLElement).click();
    (page.querySelector('label[for="condition-3"]') as HTMLElement).click();
    (page.querySelector('label[for="accessibility-5"]') as HTMLElement).click();
    const note = page.querySelector('#note') as HTMLTextAreaElement;
    note.value = 'Easy to find';
    note.dispatchEvent(new Event('input'));
    buttonCalled(page, 'Save review').click();

    const req = http.expectOne(API_URL + '/plaques/p1/visits/v9');
    expect(req.request.method).toBe('PUT');
    const body = req.request.body as FormData;
    expect([body.get('history'), body.get('condition'), body.get('accessibility'), body.get('note')])
      .toEqual(['4', '3', '5', 'Easy to find']);
    req.flush({});
    answerVisits([{ _id: 'v9', username: 'user0', date: today, note: 'Easy to find', overall: 4,
                    ratings: { history: 4, condition: 3, accessibility: 5 } }, someoneElsesVisit]);
    harness.detectChanges();

    expect(page.textContent).toContain('Thanks! Your review is saved.');
  });
});
