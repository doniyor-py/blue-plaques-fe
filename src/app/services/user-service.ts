import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpContext } from '@angular/common/http';
import { API_URL } from '../api';
import { SKIP_LOGIN_REDIRECT } from './auth-interceptor';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getMe() {
    return this.http.get<any>(API_URL + '/users/me');
  }

  getUsers(page: number, pageSize: number) {
    const params = new HttpParams().set('pn', page).set('ps', pageSize);
    return this.http.get<any>(API_URL + '/users', { params });
  }

  getFavourites() {
    return this.http.get<any[]>(API_URL + '/users/me/favourites');
  }

  addFavourite(plaqueId: string) {
    return this.http.post<any>(API_URL + '/users/me/favourites/' + plaqueId, {});
  }

  removeFavourite(plaqueId: string) {
    return this.http.delete<any>(API_URL + '/users/me/favourites/' + plaqueId);
  }
  deleteUser(username: string) {
    return this.http.delete<any>(API_URL + '/users/' + encodeURIComponent(username));
  }

  getStats() {
    return this.http.get<any>(API_URL + '/users/me/stats');
  }

  getProgress() {
    return this.http.get<any[]>(API_URL + '/users/me/progress');
  }

  //  visits, newest first; reviewedOnly = only the ones you rated
  getMyVisits(page: number, pageSize: number, reviewedOnly: boolean = false) {
    let params = new HttpParams().set('pn', page).set('ps', pageSize);
    if (reviewedOnly) {
      params = params.set('reviewed', 'true');
    }
    return this.http.get<any>(API_URL + '/users/me/visits', { params });
  }

  // a wrong old password gives 401, which must not log the user out
  changePassword(oldPassword: string, newPassword: string) {
    const formData = new FormData();
    formData.append('old_password', oldPassword);
    formData.append('new_password', newPassword);
    return this.http.put<any>(API_URL + '/users/me/password', formData, {
      context: new HttpContext().set(SKIP_LOGIN_REDIRECT, true)
    });
  }

  deleteAccount(password: string) {
    const formData = new FormData();
    formData.append('password', password);
    return this.http.delete<any>(API_URL + '/users/me', {
      body: formData,
      context: new HttpContext().set(SKIP_LOGIN_REDIRECT, true)
    });
  }
}
