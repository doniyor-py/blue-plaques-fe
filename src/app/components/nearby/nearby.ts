import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe, DecimalPipe, SlicePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { timeout, TimeoutError } from 'rxjs';
import * as L from 'leaflet';
import { PlaqueService } from '../../services/plaque-service';
import { RouteService } from '../../services/route-service';
import { decodePolyline } from '../../services/polyline';
import { DurationPipe } from '../../pipes/duration-pipe';

const LONDON = L.latLng(51.5074, -0.1278);

const PLAQUE_COLOURS: Record<string, string> = {
  blue: '#1d4f91', green: '#2e7d4f', brown: '#7b4a2a', black: '#222222', red: '#c62828',
  white: '#ffffff', grey: '#7d7d7d', bronze: '#b0743a', stone: '#a89f88'
};

@Component({
  selector: 'app-nearby',
  imports: [DatePipe, DecimalPipe, SlicePipe, RouterLink, DurationPipe],
  templateUrl: './nearby.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './nearby.css'
})
export class Nearby implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  map!: L.Map;
  plaqueLayer = L.layerGroup();
  routeLayer = L.layerGroup();
  markersById = new Map<string, { marker: L.CircleMarker; plaque: any }>();
  youMarker: L.Marker | null = null;

  userLocation: L.LatLng | null = null;
  searchCentre: L.LatLng | null = null;
  searchedFromUser: boolean = false;

  plaques: any[] = [];
  selected: any = null;
  route: any = null;

  loading: boolean = false;
  locating: boolean = false;
  routeLoading: boolean = false;
  showSearchArea: boolean = false;
  error: string = '';
  locationPermission: string = '';

  constructor(private plaqueService: PlaqueService,
              private routeService: RouteService,
              private activatedRoute: ActivatedRoute) {}

  ngAfterViewInit() {
    this.map = L.map(this.mapContainer.nativeElement, { zoomControl: false }).setView(LONDON, 15);
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
    this.plaqueLayer.addTo(this.map);
    this.routeLayer.addTo(this.map);
    this.map.on('moveend', () => this.onMapMoved());

    setTimeout(() => {
      const params = this.activatedRoute.snapshot.queryParamMap;
      const plaqueId = params.get('plaque');
      if (plaqueId) {
        this.openPlaqueFromLink(plaqueId, params.get('directions') === '1');
      } else {
        this.startWithoutPrompt();
      }
    });
  }

  async startWithoutPrompt() {
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      this.locationPermission = status.state;
    } catch {
      this.locationPermission = 'prompt';
    }
    if (this.locationPermission === 'granted') {
      this.locateMe();
    } else {
      this.searchHere();
    }
  }

  ngOnDestroy() {
    this.map?.remove();
  }

  // ---------- the user's location ----------

  locateMe() {
    this.getUserLocation(
      () => {
        this.map.setView(this.userLocation!, 16);
        this.searchHere();
      },
      () => {
        if (!this.searchCentre) { this.searchHere(); }
      }
    );
  }

  getUserLocation(onSuccess: () => void, onFail?: () => void) {
    if (!navigator.geolocation) {
      this.error = 'Your browser cannot share its location.';
      onFail?.();
      return;
    }
    this.locating = true;
    this.error = '';
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.locating = false;
        this.setUserLocation(L.latLng(position.coords.latitude, position.coords.longitude));
        onSuccess();
      },
      (geoError) => {
        this.locating = false;
        this.error = this.describeGeoError(geoError);
        if (geoError.code === geoError.PERMISSION_DENIED) { this.locationPermission = 'denied'; }
        onFail?.();
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
  }

  setUserLocation(latlng: L.LatLng) {
    this.userLocation = latlng;
    if (this.youMarker) {
      this.youMarker.setLatLng(latlng);
    } else {
      this.youMarker = L.marker(latlng, {
        icon: L.divIcon({ className: 'you-dot', iconSize: [18, 18] }),
        keyboard: false,
        zIndexOffset: 1000
      }).bindTooltip('You are here').addTo(this.map);
    }
  }

  describeGeoError(geoError: GeolocationPositionError): string {
    if (geoError.code === geoError.PERMISSION_DENIED) {
      return 'Location is turned off for this site. You can still browse the map, or allow location in your browser settings.';
    }
    if (geoError.code === geoError.TIMEOUT) {
      return 'Finding your location took too long. Please try again.';
    }
    return 'Your location is not available right now. You can still browse the map.';
  }

  // ---------- plaques on the map ----------

  searchHere() {
    const centre = this.map.getCenter();
    this.searchCentre = centre;
    this.searchedFromUser = this.userLocation !== null && centre.distanceTo(this.userLocation) < 50;
    this.showSearchArea = false;
    this.loading = true;

    this.plaqueService.getNearby(centre.lat, centre.lng, this.visibleRadius(), 50).subscribe({
      next: (response) => {
        this.plaques = response;
        this.drawMarkers();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Could not load plaques.';
        this.loading = false;
      }
    });
  }

  visibleRadius(): number {
    const metres = this.map.getCenter().distanceTo(this.map.getBounds().getNorthEast());
    return Math.min(Math.max(Math.round(metres), 300), 5000);
  }

  onMapMoved() {
    if (!this.searchCentre || this.route) { return; }
    const moved = this.map.getCenter().distanceTo(this.searchCentre);
    this.showSearchArea = moved > this.visibleRadius() * 0.4;
  }

  drawMarkers() {
    this.plaqueLayer.clearLayers();
    this.markersById.clear();
    for (const plaque of this.plaques) {
      this.addMarker(plaque);
    }
    if (this.selected && !this.markersById.has(this.selected._id)) {
      this.addMarker(this.selected);
    }
    this.updateHighlight();
  }

  addMarker(plaque: any) {
    const [lng, lat] = plaque.location.coordinates;        // GeoJSON order: [lng, lat]
    const marker = L.circleMarker([lat, lng], this.markerStyle(plaque, false))
      .bindTooltip(this.textElement(this.titleOf(plaque)))
      .on('click', () => this.selectPlaque(plaque))
      .addTo(this.plaqueLayer);
    this.markersById.set(plaque._id, { marker: marker, plaque: plaque });
  }

  markerStyle(plaque: any, isSelected: boolean): L.CircleMarkerOptions {
    return {
      radius: isSelected ? 11 : 7,
      color: plaque.colour === 'white' ? '#555555' : '#ffffff',
      weight: isSelected ? 4 : 2,
      fillColor: this.colourOf(plaque),
      fillOpacity: 1
    };
  }

  updateHighlight() {
    this.markersById.forEach(({ marker, plaque }, id) => {
      const isSelected = this.selected?._id === id;
      marker.setStyle(this.markerStyle(plaque, isSelected));
      if (isSelected) { marker.bringToFront(); }
    });
  }

  // ---------- the plaque card ----------

  selectPlaque(plaque: any) {
    this.selected = plaque;
    this.clearRoute();
    this.updateHighlight();
    this.scrollPanelToTop();
    const [lng, lat] = plaque.location.coordinates;
    if (!this.map.getBounds().contains([lat, lng])) {
      this.map.panTo([lat, lng]);
    }
  }

  closePlaque() {
    this.selected = null;
    this.clearRoute();
    this.updateHighlight();
    this.scrollPanelToTop();
  }

  scrollPanelToTop() {
    if (window.matchMedia('(max-width: 991px)').matches) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  openPlaqueFromLink(id: string, withDirections: boolean) {
    this.plaqueService.getPlaque(id, false).subscribe({
      next: (plaque) => {
        const [lng, lat] = plaque.location.coordinates;
        this.selected = plaque;
        this.map.setView([lat, lng], 16);
        this.searchHere();
        if (withDirections) { this.startDirections(); }
      },
      error: () => {
        this.error = 'Could not find that plaque.';
        this.locateMe();
      }
    });
  }

  // ---------- directions ----------

  startDirections() {
    if (!this.selected) { return; }
    if (this.userLocation) {
      this.loadRoute();
    } else {
      this.getUserLocation(() => this.loadRoute());
    }
  }

  loadRoute() {
    const [lng, lat] = this.selected.location.coordinates;
    this.routeLoading = true;
    this.error = '';

    const request = this.routeService.getWalkingRoute(this.userLocation!.lat, this.userLocation!.lng, lat, lng)
      .pipe(timeout(15000));
    request.subscribe({
      next: (response) => {
        const leg = response.trip.legs[0];
        const seconds = response.trip.summary.time;
        this.route = {
          minutes: Math.max(1, Math.round(seconds / 60)),
          distanceKm: response.trip.summary.length,
          arrival: new Date(Date.now() + seconds * 1000),
          steps: leg.maneuvers.map((step: any) => ({ text: step.instruction, km: step.length }))
        };
        this.showSearchArea = false;

        const line = decodePolyline(leg.shape, 6);
        this.routeLayer.clearLayers();
        L.polyline(line, { color: '#ffffff', weight: 9, opacity: 0.9 }).addTo(this.routeLayer);
        const path = L.polyline(line, { color: '#1a73e8', weight: 5 }).addTo(this.routeLayer);
        this.map.fitBounds(path.getBounds(), { padding: [60, 60] });
        this.routeLoading = false;
      },
      error: (err) => {
        this.error = err instanceof TimeoutError
          ? 'Finding a route took too long. Please try again.'
          : err.error?.error || 'Could not find a walking route.';
        this.routeLoading = false;
      }
    });
  }

  clearRoute() {
    this.routeLayer.clearLayers();
    this.route = null;
  }

  googleMapsUrl(plaque: any): string {
    const [lng, lat] = plaque.location.coordinates;
    let url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    if (this.userLocation) {
      url += `&origin=${this.userLocation.lat.toFixed(6)},${this.userLocation.lng.toFixed(6)}`;
    }
    return url;
  }

  distanceFromUser(plaque: any): number | null {
    if (!this.userLocation) { return null; }
    const [lng, lat] = plaque.location.coordinates;
    return Math.round(this.userLocation.distanceTo([lat, lng]));
  }

  // ---------- small helpers ----------

  titleOf(plaque: any): string {
    if (plaque.title) { return plaque.title; }
    const text = plaque.inscription || 'Plaque';
    return text.length > 60 ? text.slice(0, 60) + '…' : text;
  }

  colourOf(plaque: any): string {
    return PLAQUE_COLOURS[plaque.colour] || PLAQUE_COLOURS['blue'];
  }

  textElement(text: string): HTMLElement {
    const span = document.createElement('span');
    span.textContent = text;
    return span;
  }
}
