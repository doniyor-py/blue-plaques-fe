import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
}
