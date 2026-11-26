import { TestBed } from '@angular/core/testing';
import { Dialog } from '@angular/cdk/dialog';
import { formatDate } from '@angular/common';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { Plaque } from './plaque';
import { ToastService } from '../../services/toast-service';
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
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        provideRouter([{ path: 'plaques/:id', component: Plaque }])
      ]
    });
    harness = await RouterTestingHarness.create();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    TestBed.inject(Dialog).closeAll();
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

  // the toast lives in the app shell, so the test presses its action through the service
  function rateFromToast() {
    TestBed.inject(ToastService).current()!.actions![0].run();
    harness.detectChanges();
  }

  function checkIn(page: HTMLElement) {
    buttonCalled(page, "I've visited").click();
    const req = http.expectOne(r => r.url === API_URL + '/plaques/p1/visits' && r.method === 'POST');
    expect([...(req.request.body as FormData).keys()]).toEqual([]);
    req.flush({ _id: 'v9' }, { status: 201, statusText: 'Created' });
    answerVisits([{ _id: 'v9', username: 'user0', date: today, note: '' }, someoneElsesVisit]);
    harness.detectChanges();
  }

  it('asks for the plaque and its visits at the same time', async () => {
    await harness.navigateByUrl('/plaques/p1', Plaque);
    const plaqueRequest = http.expectOne(API_URL + '/plaques/p1');
    answerVisits([someoneElsesVisit]);
    plaqueRequest.flush(plaque);
    harness.detectChanges();
    http.expectOne(API_URL + '/plaques/p1/photos').flush([]);
    harness.detectChanges();

    const page = harness.routeNativeElement as HTMLElement;
    expect(page.querySelector('#visits-heading')!.textContent).toContain('Visitor notes');
    expect(page.textContent).toContain('1 visit');
  });

  it('opens the review form from a ?visit=...&review=1 link when the visits arrive first', async () => {
    localStorage.setItem('token', userToken);
    await harness.navigateByUrl('/plaques/p1?visit=v9&review=1', Plaque);
    http.expectOne(API_URL + '/users/me').flush({ username: 'user0', favourites: [] });
    const plaqueRequest = http.expectOne(API_URL + '/plaques/p1');
    answerVisits([{ _id: 'v9', username: 'user0', date: today, note: '' }]);
    plaqueRequest.flush(plaque);
    harness.detectChanges();
    http.expectOne(API_URL + '/plaques/p1/photos').flush([]);
    harness.detectChanges();

    const page = harness.routeNativeElement as HTMLElement;
    expect(buttonCalled(page, 'Save review')).toBeTruthy();
  });

  it('shows only "Plaque not found." when the plaque does not exist', async () => {
    await harness.navigateByUrl('/plaques/p1', Plaque);
    const notFound = { status: 404, statusText: 'Not Found' };
    http.expectOne(API_URL + '/plaques/p1').flush({ error: 'Plaque not found' }, notFound);
    http.expectOne(r => r.url === API_URL + '/plaques/p1/visits').flush({ error: 'Plaque not found' }, notFound);
    harness.detectChanges();

    const page = harness.routeNativeElement as HTMLElement;
    expect(page.textContent).toContain('Plaque not found.');
    expect(harness.routeDebugElement!.componentInstance.visitError).toBe('');
  });

  it('marks the plaque as saved straight away, and undoes it if saving fails', async () => {
    const page = await openPlaque(true);
    buttonCalled(page, 'Save').click();
    harness.detectChanges();

    const button = buttonCalled(page, 'Saved');
    expect(button.disabled).toBeTrue();
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Save');

    http.expectOne(API_URL + '/users/me/favourites/p1')
      .flush({ error: 'Something went wrong on the server' }, { status: 500, statusText: 'Server Error' });
    harness.detectChanges();

    expect(buttonCalled(page, 'Save').disabled).toBeFalse();
    expect(buttonCalled(page, 'Save').getAttribute('aria-pressed')).toBe('false');
    expect(page.textContent).toContain('Something went wrong on the server');
  });

  it('says "Saved to your favourites" once the save goes through', async () => {
    const page = await openPlaque(true);
    buttonCalled(page, 'Save').click();
    http.expectOne(API_URL + '/users/me/favourites/p1').flush({ message: 'Added to favourites' });
    harness.detectChanges();
    expect(TestBed.inject(ToastService).current()!.text).toBe('Saved to your favourites');
  });

  it('shows the plaque and its visits', async () => {
    const page = await openPlaque(false);
    expect(page.querySelector('h1')!.textContent!.trim()).toBe('Charles Dickens');
    expect(page.querySelector('#visits-heading')!.textContent).toContain('Visitor notes');
    expect(page.textContent).toContain('1 visit');
  });

  it('shows a breadcrumb back to the borough', async () => {
    const page = await openPlaque(false);
    const crumbs = [...page.querySelectorAll('nav[aria-label="Breadcrumb"] li')].map(li => li.textContent!.trim());
    expect(crumbs).toEqual(['Browse plaques', 'Camden', 'Charles Dickens']);
    expect(page.querySelector('nav[aria-label="Breadcrumb"] a[href="/plaques?borough=Camden"]')).toBeTruthy();
    expect(page.querySelector('[aria-current="page"]')!.textContent).toContain('Charles Dickens');
  });

  it('sends a visitor who is not logged in to the login page', async () => {
    const page = await openPlaque(false);
    const link = [...page.querySelectorAll('a')].find(a => a.textContent!.trim() === "I've visited")!;
    expect(link.getAttribute('href')).toBe('/login?returnUrl=%2Fplaques%2Fp1');
  });

  it("\"I've visited\" saves a visit without a review and offers to rate it", async () => {
    const page = await openPlaque(true);
    checkIn(page);

    const toast = TestBed.inject(ToastService).current()!;
    expect(toast.text).toBe('Visit saved:');
    expect(toast.actions!.map(action => action.label)).toEqual(['rate it', 'add a photo']);
    expect(buttonCalled(page, 'Visited today').disabled).toBeTrue();
    expect(page.textContent).toContain('2 visits');
  });

  it('will not save a review until all three ratings are chosen', async () => {
    const page = await openPlaque(true);
    checkIn(page);
    rateFromToast();
    harness.detectChanges();

    buttonCalled(page, 'Save review').click();
    harness.detectChanges();

    expect(page.textContent!.match(/Please choose from 1 to 5 stars/g)!.length).toBe(3);
    http.expectNone(r => r.method === 'PUT');
  });

  it('saves the chosen stars and the note', async () => {
    const page = await openPlaque(true);
    checkIn(page);
    rateFromToast();
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

  it('asks in a dialog before deleting a visit, and does nothing on Cancel', async () => {
    const page = await openPlaque(true);
    checkIn(page);
    const deleteButton = page.querySelector<HTMLButtonElement>('[aria-label^="Delete visit by user0"]')!;

    deleteButton.click();
    TestBed.tick();
    const dialog = document.querySelector<HTMLElement>('[role="alertdialog"]')!;
    expect(dialog.textContent).toContain('Delete this visit?');
    expect(document.activeElement!.id).toBe('confirm-cancel');
    buttonCalled(dialog, 'Cancel').click();
    TestBed.tick();
    http.expectNone(r => r.method === 'DELETE');
    expect(document.querySelector('[role="alertdialog"]')).toBeNull();

    deleteButton.click();
    TestBed.tick();
    buttonCalled(document.querySelector<HTMLElement>('[role="alertdialog"]')!, 'Delete visit').click();
    http.expectOne(r => r.url === API_URL + '/plaques/p1/visits/v9' && r.method === 'DELETE').flush({});
    answerVisits([someoneElsesVisit]);
  });
});
