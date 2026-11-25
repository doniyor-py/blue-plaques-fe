import { HttpInterceptorFn, HttpErrorResponse, HttpContextToken } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth-service';
import { API_URL } from '../api';

export const SKIP_LOGIN_REDIRECT = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // only send our token to our own API, never to other sites
  if (token && req.url.startsWith(API_URL)) {
    req = req.clone({ setHeaders: { 'x-access-token': token } });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.includes('/login') && !req.context.get(SKIP_LOGIN_REDIRECT)) {
        authService.removeToken();
        const returnUrl = router.url.startsWith('/login') ? null : router.url;
        router.navigate(['/login'], { queryParams: { notice: 'session-expired', returnUrl } });
      }
      return throwError(() => err);   // pass the error on
    })
  );
};
