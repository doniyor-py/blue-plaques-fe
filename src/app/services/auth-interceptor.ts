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

  // only send our token to our own API, never to other sites (e.g. a maps or weather API later)
  if (token && req.url.startsWith(API_URL)) {
    req = req.clone({ setHeaders: { 'x-access-token': token } });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.endsWith('/login') && !req.context.get(SKIP_LOGIN_REDIRECT)) {
        authService.removeToken();
        router.navigate(['/login']);
      }
      return throwError(() => err);   // pass the error on
    })
  );
};
