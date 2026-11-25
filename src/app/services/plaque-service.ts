import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { API_URL } from '../api';

@Injectable({
  providedIn: 'root'
})
export class PlaqueService {
  private savedLists = new Map<string, Observable<string[]>>();

  constructor(private http: HttpClient) {}

  getPlaques(page: number, pageSize: number) {
    const params = new HttpParams()
      .set('pn', page)
      .set('ps', pageSize);
    return this.http.get<any>(API_URL + '/plaques', { params });
  }

  getPlaque(id: string, countView: boolean = true) {
    const params = countView ? new HttpParams() : new HttpParams().set('view', 'false');
    return this.http.get<any>(API_URL + '/plaques/' + id, { params });
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
    return this.getSavedList('/boroughs');
  }

  getColours() {
    return this.getSavedList('/colours');
  }

  private getSavedList(path: string): Observable<string[]> {
    if (!this.savedLists.has(path)) {
      const request = this.http.get<string[]>(API_URL + path).pipe(
        tap({ error: () => this.savedLists.delete(path) }),
        shareReplay(1)
      );
      this.savedLists.set(path, request);
    }
    return this.savedLists.get(path)!;
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
      if (plaque[key] !== null && plaque[key] !== undefined) {
        formData.append(key, plaque[key]);
      }
    }
    return formData;
  }

  getNearby(lat: number, lng: number, radius: number, limit: number = 20) {
    const params = new HttpParams()
      .set('lat', lat).set('lng', lng).set('radius', radius).set('limit', limit);
    return this.http.get<any[]>(API_URL + '/plaques/nearby', { params });
  }



}
