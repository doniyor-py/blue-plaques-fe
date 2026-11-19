import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from '../api';

@Injectable({ providedIn: 'root' })
export class VisitService {
  constructor(private http: HttpClient) {}

  // newest first; the API sends { total, page, page_size, pages, visits }
  getVisits(plaqueId: string, pageSize: number = 100) {
    const params = new HttpParams()
      .set('sort', 'date').set('order', 'desc')
      .set('pn', 1).set('ps', pageSize);
    return this.http.get<any>(API_URL + '/plaques/' + plaqueId + '/visits', { params });
  }

  // "I've visited": no ratings needed, the API answers with the new visit's _id
  checkIn(plaqueId: string) {
    return this.http.post<any>(API_URL + '/plaques/' + plaqueId + '/visits', new FormData());
  }

  saveReview(plaqueId: string, visitId: string, review: any) {
    const formData = new FormData();
    formData.append('history', review.history);
    formData.append('condition', review.condition);
    formData.append('accessibility', review.accessibility);
    formData.append('note', review.note || '');
    return this.http.put<any>(API_URL + '/plaques/' + plaqueId + '/visits/' + visitId, formData);
  }

  deleteVisit(plaqueId: string, visitId: string) {
    return this.http.delete(API_URL + '/plaques/' + plaqueId + '/visits/' + visitId);
  }
}
