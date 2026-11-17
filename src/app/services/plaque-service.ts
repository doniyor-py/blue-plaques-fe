import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from '../api';

@Injectable({
  providedIn: 'root'
})
export class PlaqueService {

  constructor(private http: HttpClient) {}

  getPlaques(page: number, pageSize: number) {
    const params = new HttpParams()
      .set('pn', page)
      .set('ps', pageSize);
    return this.http.get<any>(API_URL + '/plaques', { params });
  }

  getPlaque(id: string) {
    return this.http.get<any>(API_URL + '/plaques/' + id);
  }

  getRandomPlaque() {
    return this.http.get<any>(API_URL + '/plaques/random');
  }

  searchPlaques(filters: any, page: number, pageSize: number) {
  let params = new HttpParams().set('pn', page).set('ps', pageSize);
  for (const key of Object.keys(filters)) {
    if (filters[key]) {
      params = params.set(key, filters[key]);
    }
  }
  return this.http.get<any>(API_URL + '/plaques/search', { params });
 }


}
