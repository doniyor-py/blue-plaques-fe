import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../api';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  constructor(private http: HttpClient) {}

  getPhotos(plaqueId: string) {
    return this.http.get<any[]>(API_URL + '/plaques/' + plaqueId + '/photos');
  }

  uploadPhoto(plaqueId: string, file: File, caption: string) {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('caption', caption);
    return this.http.post<any>(API_URL + '/plaques/' + plaqueId + '/photos', formData);
  }

  deletePhoto(plaqueId: string, photoId: string) {
    return this.http.delete<any>(API_URL + '/plaques/' + plaqueId + '/photos/' + photoId);
  }
}
