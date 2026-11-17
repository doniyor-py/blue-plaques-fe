import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ROUTING_URL } from '../api';

@Injectable({ providedIn: 'root' })
export class RouteService {
  constructor(private http: HttpClient) {}

  getWalkingRoute(fromLat: number, fromLng: number, toLat: number, toLng: number) {
    const body = {
      locations: [
        { lat: fromLat, lon: fromLng },
        { lat: toLat, lon: toLng }
      ],
      costing: 'pedestrian',
      units: 'kilometers'
    };
    return this.http.post<any>(ROUTING_URL, body);
  }
}
