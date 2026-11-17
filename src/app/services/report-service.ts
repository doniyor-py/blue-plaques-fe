import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from '../api';

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private http: HttpClient) {}

  reportProblem(plaqueId: string, type: string, message: string) {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('message', message);
    return this.http.post<any>(API_URL + '/plaques/' + plaqueId + '/reports', formData);
  }
  getReports(page: number, pageSize: number, status: string) {
    let params = new HttpParams().set('pn', page).set('ps', pageSize);
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<any>(API_URL + '/reports', { params });
  }

  updateStatus(reportId: string, status: string) {
    const formData = new FormData();
    formData.append('status', status);
    return this.http.put<any>(API_URL + '/reports/' + reportId, formData);
  }
}
