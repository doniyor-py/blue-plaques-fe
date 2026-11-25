import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { AuthService } from './auth-service';
import { testProviders } from '../testing/test-providers';
import { API_URL } from '../api';

function makeToken(payload: object): string {
  return 'header.' + btoa(JSON.stringify(payload)) + '.signature';
}

const inOneHour = Math.floor(Date.now() / 1000) + 3600;
const anHourAgo = Math.floor(Date.now() / 1000) - 3600;

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.removeItem('token');
    TestBed.configureTestingModule({ providers: testProviders });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem('token');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login sends the name and password as Basic Auth', () => {
    service.login('user0', 'UserPass123').subscribe();

    const req = http.expectOne(API_URL + '/login');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Basic ' + btoa('user0:UserPass123'));
    req.flush({ token: 'abc' });
  });

  it('login works with non-Latin passwords (sent as UTF-8, like the API expects)', () => {
    // btoa('пароль') on its own would throw an error
    service.login('user0', 'пароль123').subscribe();

    const req = http.expectOne(API_URL + '/login');
    expect(req.request.headers.get('Authorization')).toBe('Basic dXNlcjA60L/QsNGA0L7Qu9GMMTIz');
    req.flush({ token: 'abc' });
  });

  it('is logged out when there is no token', () => {
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.getUsername()).toBe('');
    expect(service.isAdmin()).toBeFalse();
  });

  it('reads the username from a valid token', () => {
    service.saveToken(makeToken({ username: 'user0', admin: false, exp: inOneHour }));
    expect(service.isLoggedIn()).toBeTrue();
    expect(service.getUsername()).toBe('user0');
    expect(service.isAdmin()).toBeFalse();
  });

  it('knows when the user is an admin', () => {
    service.saveToken(makeToken({ username: 'admin1', admin: true, exp: inOneHour }));
    expect(service.isAdmin()).toBeTrue();
  });

  it('treats an expired token as logged out', () => {
    service.saveToken(makeToken({ username: 'user0', admin: true, exp: anHourAgo }));
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.isAdmin()).toBeFalse();
  });

  it('treats a broken token as logged out instead of crashing', () => {
    service.saveToken('this-is-not-a-token');
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('removeToken logs the user out', () => {
    service.saveToken(makeToken({ username: 'user0', exp: inOneHour }));
    service.removeToken();
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('register sends the details, the human-check token and the terms answer', () => {
    service.register('newuser', 'new@example.com', 'Password1', 'captcha-token', true).subscribe();

    const req = http.expectOne(API_URL + '/register');
    expect(req.request.method).toBe('POST');
    const body = req.request.body as FormData;
    expect(body.get('username')).toBe('newuser');
    expect(body.get('email')).toBe('new@example.com');
    expect(body.get('captcha_token')).toBe('captcha-token');
    expect(body.get('accept_terms')).toBe('true');
    req.flush({});
  });
});
