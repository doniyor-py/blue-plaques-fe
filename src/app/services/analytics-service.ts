import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from '../api';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private http: HttpClient) {}

  getBoroughs() {
    return this.http.get<any[]>(API_URL + '/analytics/boroughs');
  }

  getDecades() {
    return this.http.get<any[]>(API_URL + '/analytics/decades');
  }

  getProfessions() {
    return this.http.get<any[]>(API_URL + '/analytics/professions');
  }

  getRatings() {
    return this.http.get<any[]>(API_URL + '/analytics/ratings');
  }

  getTopRated(minVisits: number = 3, limit: number = 10) {
    const params = new HttpParams().set('min_visits', minVisits).set('limit', limit);
    return this.http.get<any[]>(API_URL + '/analytics/top-rated', { params });
  }

  getAges() {
    return this.http.get<any>(API_URL + '/analytics/ages');
  }
}
