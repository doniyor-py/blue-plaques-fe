import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { PlaqueService } from '../../services/plaque-service';

const LONDON: L.LatLngTuple = [51.5074, -0.1278];

@Component({
  selector: 'app-nearby',
  imports: [SlicePipe, RouterLink],
  templateUrl: './nearby.html',
  styleUrl: './nearby.css'
})
export class Nearby implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  map!: L.Map;
  plaqueLayer = L.layerGroup();
  youMarker: L.CircleMarker | null = null;
  point: L.LatLng | null = null;

  radius: number = 1000;
  radiusOptions = [250, 500, 1000, 2000];
  plaques: any[] = [];
  loading: boolean = false;
  locating: boolean = false;
  error: string = '';

  constructor(private plaqueService: PlaqueService) {}

  ngAfterViewInit() {
    this.map = L.map(this.mapContainer.nativeElement).setView(LONDON, 13);
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
    this.plaqueLayer.addTo(this.map);

    this.map.on('click', (event: L.LeafletMouseEvent) => this.setPoint(event.latlng));
  }

  ngOnDestroy() {
    this.map?.remove();
  }

  useMyLocation() {
    if (!navigator.geolocation) {
      this.error = 'Your browser cannot share its location.';
      return;
    }
    this.locating = true;
    this.error = '';
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.locating = false;
        this.setPoint(L.latLng(position.coords.latitude, position.coords.longitude));
      },
      (geoError) => {
        this.locating = false;
        if (geoError.code === geoError.PERMISSION_DENIED) {
          this.error = 'Location permission is blocked. Allow it in your browser (and in your computer\'s settings), or click on the map instead.';
        } else if (geoError.code === geoError.TIMEOUT) {
          this.error = 'Finding your location took too long. Try again, or click on the map instead.';
        } else {
          this.error = 'Your location is not available right now. Click on the map to choose a point instead.';
        }
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
  }

  setPoint(latlng: L.LatLng) {
    this.point = latlng;
    if (this.youMarker) {
      this.youMarker.setLatLng(latlng);
    } else {
      this.youMarker = L.circleMarker(latlng, {
        radius: 9, color: '#ffffff', weight: 3, fillColor: '#d63384', fillOpacity: 1
      }).bindTooltip('You are here').addTo(this.map);
    }
    this.map.setView(latlng, 15);
    this.loadNearby();
  }

  loadNearby() {
    if (!this.point) { return; }
    this.loading = true;
    this.error = '';
    this.plaqueService.getNearby(this.point.lat, this.point.lng, this.radius).subscribe({
      next: (response) => {
        this.plaques = response;
        this.drawPlaques();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Could not load nearby plaques.';
        this.loading = false;
      }
    });
  }

  drawPlaques() {
    this.plaqueLayer.clearLayers();
    for (const plaque of this.plaques) {
      const [lng, lat] = plaque.location.coordinates;

      const popup = document.createElement('div');
      popup.textContent = (plaque.inscription || '').slice(0, 120) + '... (' + plaque.distance_m + ' m)';

      L.circleMarker([lat, lng], {
        radius: 7, color: '#0d6efd', fillColor: '#0d6efd', fillOpacity: 0.8
      }).bindPopup(popup).addTo(this.plaqueLayer);
    }
  }

  changeRadius(value: string) {
    this.radius = Number(value);
    this.loadNearby();
  }

  radiusLabel(metres: number): string {
    return metres < 1000 ? metres + ' m' : (metres / 1000) + ' km';
  }
}
