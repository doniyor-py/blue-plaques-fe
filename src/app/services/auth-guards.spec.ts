import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';

import { authGuard, adminGuard } from './auth-guards';
import { AuthService } from './auth-service';

describe('Route guards', () => {
  // a fake AuthService: each test decides who is "logged in"
  let loggedIn = false;
  let admin = false;
  const fakeAuth = { isLoggedIn: () => loggedIn, isAdmin: () => admin };

  beforeEach(() => {
    loggedIn = false;
    admin = false;
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: fakeAuth }]
    });
  });

  // guards use inject(), so they must run inside Angular's injection context
  function runGuard(guard: CanActivateFn, url: string) {
    return TestBed.runInInjectionContext(
      () => guard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot));
  }

  // turn the guard's answer (a UrlTree) into a readable address
  function addressOf(result: unknown): string {
    return TestBed.inject(Router).serializeUrl(result as UrlTree);
  }

  it('authGuard lets a logged-in user in', () => {
    loggedIn = true;
    expect(runGuard(authGuard, '/profile')).toBeTrue();
  });

  it('authGuard sends a visitor to login and remembers the page', () => {
    expect(addressOf(runGuard(authGuard, '/profile'))).toBe('/login?returnUrl=%2Fprofile');
  });

  it('adminGuard lets an admin in', () => {
    loggedIn = true;
    admin = true;
    expect(runGuard(adminGuard, '/admin/users')).toBeTrue();
  });

  it('adminGuard sends a normal user to the home page', () => {
    loggedIn = true;
    expect(addressOf(runGuard(adminGuard, '/admin/users'))).toBe('/');
  });

  it('adminGuard sends a visitor to login and remembers the page', () => {
    expect(addressOf(runGuard(adminGuard, '/admin/reports'))).toBe('/login?returnUrl=%2Fadmin%2Freports');
  });
});
