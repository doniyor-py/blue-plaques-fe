import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from '../api';

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
}
