import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpContext, provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';

import { authInterceptor, SKIP_LOGIN_REDIRECT } from './auth-interceptor';
import { API_URL, ROUTING_URL } from '../api';

describe('authInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr(), withInterceptors([authInterceptor])),    // the real interceptor, as in app.config.ts
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
  });

  afterEach(() => {
    backend.verify();
    localStorage.removeItem('token');
  });

  const unauthorised = { status: 401, statusText: 'Unauthorized' };

  it('adds the token to requests to our API', () => {
    http.get(API_URL + '/users/me').subscribe();
    const req = backend.expectOne(API_URL + '/users/me');
    expect(req.request.headers.get('x-access-token')).toBe('test-token');
    req.flush({});
  });

  it('never sends the token to other websites', () => {
    http.get(ROUTING_URL).subscribe();
    const req = backend.expectOne(ROUTING_URL);
    expect(req.request.headers.has('x-access-token')).toBeFalse();
    req.flush({});
  });

  it('sends no token when nobody is logged in', () => {
    localStorage.removeItem('token');
    http.get(API_URL + '/plaques').subscribe();
    const req = backend.expectOne(API_URL + '/plaques');
    expect(req.request.headers.has('x-access-token')).toBeFalse();
    req.flush({});
  });

  it('on a 401, logs out and opens login with a notice and the current page', () => {
    spyOnProperty(router, 'url').and.returnValue('/plaques?borough=Camden');
    let status = 0;
    http.get(API_URL + '/users/me').subscribe({ error: (err) => status = err.status });

    backend.expectOne(API_URL + '/users/me').flush({ error: 'Token has expired' }, unauthorised);

    expect(status).toBe(401);
    expect(localStorage.getItem('token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { notice: 'session-expired', returnUrl: '/plaques?borough=Camden' }
    });
  });

  it('leaves returnUrl out when the user is already on the login page', () => {
    spyOnProperty(router, 'url').and.returnValue('/login');
    http.get(API_URL + '/users/me').subscribe({ error: () => undefined });
    backend.expectOne(API_URL + '/users/me').flush({}, unauthorised);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { notice: 'session-expired', returnUrl: null }
    });
  });

  it('does not redirect when a login attempt has the wrong password', () => {
    http.get(API_URL + '/login').subscribe({ error: () => undefined });
    backend.expectOne(API_URL + '/login').flush({ error: 'Wrong email, username or password' }, unauthorised);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBe('test-token');
  });

  it('does not redirect when the request asked not to (wrong old password)', () => {
    const context = new HttpContext().set(SKIP_LOGIN_REDIRECT, true);
    http.put(API_URL + '/users/me/password', {}, { context }).subscribe({ error: () => undefined });
    backend.expectOne(API_URL + '/users/me/password').flush({ error: 'Old password is incorrect' }, unauthorised);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBe('test-token');
  });

  it('does not log out on other errors, such as 500', () => {
    http.get(API_URL + '/plaques').subscribe({ error: () => undefined });
    backend.expectOne(API_URL + '/plaques').flush({}, { status: 500, statusText: 'Server Error' });
    expect(router.navigate).not.toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBe('test-token');
  });
});
