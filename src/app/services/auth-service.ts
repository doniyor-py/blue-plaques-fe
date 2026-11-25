import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_URL } from '../api';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    const bytes = new TextEncoder().encode(username + ':' + password);
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(String.fromCharCode(...bytes))
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

  register(username: string, email: string, password: string, captchaToken: string, acceptTerms: boolean) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('captcha_token', captchaToken);
    formData.append('accept_terms', acceptTerms ? 'true' : 'false');
    return this.http.post<any>(API_URL + '/register', formData);
  }

  verifyRegistration(email: string, code: string) {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('code', code);
    return this.http.post<any>(API_URL + '/register/verify', formData);
  }


  forgotPassword(email: string) {
    const formData = new FormData();
    formData.append('email', email);
    return this.http.post<any>(API_URL + '/password/forgot', formData);
  }

  resetPassword(email: string, code: string, newPassword: string) {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('code', code);
    formData.append('new_password', newPassword);
    return this.http.post<any>(API_URL + '/password/reset', formData);
  }


  loginWithGoogle(credential: string) {
    const formData = new FormData();
    formData.append('credential', credential);
    formData.append('accept_terms', 'true');
    return this.http.post<any>(API_URL + '/login/google', formData);
  }


}
