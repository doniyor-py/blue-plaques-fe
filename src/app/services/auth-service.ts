import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_URL } from '../api';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(username + ':' + password)
    });
    return this.http.get<any>(API_URL + '/login', { headers });
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  removeToken() {
    localStorage.removeItem('token');
  }

  private getPayload(): any {
    const token = this.getToken();
    if (!token) { return null; }
    try {
      const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(part));
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    const payload = this.getPayload();
    return payload !== null && payload.exp * 1000 > Date.now();
  }

  getUsername(): string {
    return this.isLoggedIn() ? this.getPayload().username : '';
  }

  isAdmin(): boolean {
    return this.isLoggedIn() && this.getPayload().admin === true;
  }

  logout() {
    return this.http.get<any>(API_URL + '/logout');
  }
}
