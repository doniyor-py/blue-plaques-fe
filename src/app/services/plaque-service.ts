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

  getBoroughs() {
    return this.http.get<string[]>(API_URL + '/boroughs');
  }

  createPlaque(plaque: any) {
    return this.http.post<any>(API_URL + '/plaques', this.toFormData(plaque));
  }

  updatePlaque(id: string, plaque: any) {
    return this.http.put<any>(API_URL + '/plaques/' + id, this.toFormData(plaque));
  }

  deletePlaque(id: string) {
    return this.http.delete<any>(API_URL + '/plaques/' + id);
  }

  private toFormData(plaque: any): FormData {
    const formData = new FormData();
    for (const key of Object.keys(plaque)) {
      if (plaque[key] !== null && plaque[key] !== '') {
        formData.append(key, plaque[key]);
      }
    }
    return formData;
  }


}
