import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../api';

@Injectable({ providedIn: 'root' })
export class VisitService {
  constructor(private http: HttpClient) {}

  getVisits(plaqueId: string) {
    return this.http.get<any[]>(API_URL + '/plaques/' + plaqueId + '/visits');
  }

  addVisit(plaqueId: string, visit: any) {
    return this.http.post<any>(API_URL + '/plaques/' + plaqueId + '/visits', this.toFormData(visit));
  }

  editVisit(plaqueId: string, visitId: string, visit: any) {
    return this.http.put<any>(API_URL + '/plaques/' + plaqueId + '/visits/' + visitId, this.toFormData(visit));
  }

  deleteVisit(plaqueId: string, visitId: string) {
    return this.http.delete(API_URL + '/plaques/' + plaqueId + '/visits/' + visitId);
  }

  // Flask reads request.form, so send multipart form data instead of JSON
  private toFormData(visit: any): FormData {
    const formData = new FormData();
    formData.append('history', visit.history);
    formData.append('condition', visit.condition);
    formData.append('accessibility', visit.accessibility);
    formData.append('note', visit.note || '');
    return formData;
  }
}
