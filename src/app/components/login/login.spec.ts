import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { Login } from './login';
import { ScriptLoader } from '../../services/script-loader';
import { API_URL } from '../../api';

describe('Login', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    localStorage.removeItem('token');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', component: Login }]),
        { provide: ScriptLoader, useValue: { load: () => new Promise(() => undefined) } }
      ]
    });
    harness = await RouterTestingHarness.create();
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem('token');
  });

  async function openLogin(url = '/login'): Promise<HTMLElement> {
    await harness.navigateByUrl(url, Login);
    return harness.routeNativeElement as HTMLElement;
  }

  function type(page: HTMLElement, selector: string, value: string) {
    const input = page.querySelector(selector) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function submit(page: HTMLElement) {
    page.querySelector('form')!.dispatchEvent(new Event('submit'));
    harness.detectChanges();
  }

  it('shows why the user was sent to the login page', async () => {
    const page = await openLogin('/login?notice=session-expired');
    expect(page.textContent).toContain('Your session has expired');
  });

  it('sends nothing and marks both fields when the form is empty', async () => {
    const page = await openLogin();
    submit(page);
    expect(page.querySelectorAll('.is-invalid').length).toBe(2);
    http.expectNone(API_URL + '/login');
  });

  it('logs in, saves the token and goes back to the page the user came from', async () => {
    const page = await openLogin('/login?returnUrl=%2Fprofile');
    spyOn(router, 'navigateByUrl').and.resolveTo(true);

    type(page, '#username', 'user0');
    type(page, '#password', 'UserPass123');
    submit(page);

    const req = http.expectOne(API_URL + '/login');
    expect(req.request.headers.get('Authorization')).toBe('Basic ' + btoa('user0:UserPass123'));
    req.flush({ token: 'new-token' });

    expect(localStorage.getItem('token')).toBe('new-token');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/profile');
  });

  it('shows the error from the API when the password is wrong', async () => {
    const page = await openLogin();
    type(page, '#username', 'user0');
    type(page, '#password', 'wrong-password');
    submit(page);

    http.expectOne(API_URL + '/login').flush(
      { error: 'Wrong email, username or password' }, { status: 401, statusText: 'Unauthorized' });
    harness.detectChanges();

    expect(page.querySelector('[role=alert]')!.textContent).toContain('Wrong email, username or password');
    expect(localStorage.getItem('token')).toBeNull();
    expect((page.querySelector('button[type=submit]') as HTMLButtonElement).disabled).toBeFalse();
  });
});
