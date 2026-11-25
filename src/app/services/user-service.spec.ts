import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { UserService } from './user-service';
import { SKIP_LOGIN_REDIRECT } from './auth-interceptor';
import { testProviders } from '../testing/test-providers';
import { API_URL } from '../api';

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testProviders });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getMyVisits asks for all visits by default', () => {
    service.getMyVisits(1, 5).subscribe();
    const req = http.expectOne(API_URL + '/users/me/visits?pn=1&ps=5');
    expect(req.request.method).toBe('GET');
    req.flush({ total: 0, visits: [] });
  });

  it('getMyVisits can ask for reviewed visits only', () => {
    service.getMyVisits(2, 5, true).subscribe();
    const req = http.expectOne(API_URL + '/users/me/visits?pn=2&ps=5&reviewed=true');
    expect(req.request.method).toBe('GET');
    req.flush({ total: 0, visits: [] });
  });

  it('changePassword sends both passwords and must not log the user out on a wrong one', () => {
    service.changePassword('OldPass123', 'NewPass456').subscribe();

    const req = http.expectOne(API_URL + '/users/me/password');
    expect(req.request.method).toBe('PUT');
    const body = req.request.body as FormData;
    expect(body.get('old_password')).toBe('OldPass123');
    expect(body.get('new_password')).toBe('NewPass456');
    expect(req.request.context.get(SKIP_LOGIN_REDIRECT)).toBeTrue();
    req.flush({});
  });

  it('deleteAccount sends the password in the body of a DELETE', () => {
    service.deleteAccount('MyPass123').subscribe();

    const req = http.expectOne(API_URL + '/users/me');
    expect(req.request.method).toBe('DELETE');
    expect((req.request.body as FormData).get('password')).toBe('MyPass123');
    expect(req.request.context.get(SKIP_LOGIN_REDIRECT)).toBeTrue();
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('deleteUser makes the username safe to put in a URL', () => {
    service.deleteUser('a b/c').subscribe();
    const req = http.expectOne(API_URL + '/users/a%20b%2Fc');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('addFavourite posts to that plaque', () => {
    service.addFavourite('p1').subscribe();
    const req = http.expectOne(API_URL + '/users/me/favourites/p1');
    expect(req.request.method).toBe('POST');
    req.flush({});
  });
});
