import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, Injector, afterNextRender, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe, DecimalPipe, SlicePipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { timeout, TimeoutError } from 'rxjs';
import * as L from 'leaflet';
import { PlaqueService } from '../../services/plaque-service';
import { RouteService } from '../../services/route-service';
import { decodePolyline } from '../../services/polyline';
import { DurationPipe } from '../../pipes/duration-pipe';
import { plaqueColour, street, categoryLabel } from '../../plaque-text';

const LONDON = L.latLng(51.5074, -0.1278);

const MARKER_LETTERS: Record<string, string> = { blue: 'B', green: 'G', black: 'K', brown: 'Br' };

@Component({
  selector: 'app-nearby',
  imports: [DatePipe, DecimalPipe, SlicePipe, TitleCasePipe, RouterLink, DurationPipe],
  templateUrl: './nearby.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './nearby.css'
})
export class Nearby implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  map!: L.Map;
  plaqueLayer = L.layerGroup();
  routeLayer = L.layerGroup();
  markersById = new Map<string, { marker: L.Marker; plaque: any }>();
  youMarker: L.Marker | null = null;

  userLocation: L.LatLng | null = null;
  searchCentre: L.LatLng | null = null;
  searchedFromUser: boolean = false;

  plaques: any[] = [];
  selected: any = null;
  route: any = null;
  routeLine: L.LatLngExpression[] = [];
  routeShown: boolean = false;
  withinWalk: boolean = false;
  sheetOpen: boolean = true;

  loading: boolean = false;
  locating: boolean = false;
  routeLoading: boolean = false;
  showSearchArea: boolean = false;
  error: string = '';
  locationPermission: string = '';

  constructor(private plaqueService: PlaqueService,
              private routeService: RouteService,
              private activatedRoute: ActivatedRoute,
              private injector: Injector) {}

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

  askingForLocation(): boolean {
    return this.locationPermission === 'prompt' && !this.userLocation;
  }

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
    const marker = L.marker([lat, lng], { icon: this.markerIcon(plaque, false), title: this.titleOf(plaque) })
      .bindTooltip(this.textElement(this.titleOf(plaque)))
      .on('click', () => this.selectPlaque(plaque, true))
      .addTo(this.plaqueLayer);
    this.markersById.set(plaque._id, { marker: marker, plaque: plaque });
  }

  markerIcon(plaque: any, isSelected: boolean): L.DivIcon {
    const size = isSelected ? 40 : 28;
    return L.divIcon({
      className: 'plaque-marker-icon',
      html: `<span class="plaque-marker${isSelected ? ' selected' : ''}" style="background:${this.colourOf(plaque)}">`
            + `${this.letterOf(plaque)}</span>`,
      iconSize: [size, size]
    });
  }

  updateHighlight() {
    this.markersById.forEach(({ marker, plaque }, id) => {
      const isSelected = this.selected?._id === id;
      marker.setIcon(this.markerIcon(plaque, isSelected));
      marker.setZIndexOffset(isSelected ? 1000 : 0);
    });
  }

  // "Within 15 min walk" only makes sense when the distances are from the user
  visiblePlaques(): any[] {
    if (!this.withinWalk || !this.searchedFromUser) { return this.plaques; }
    return this.plaques.filter(plaque => plaque.walking_minutes <= 15);
  }

  toggleSheet(open: boolean = !this.sheetOpen) {
    this.sheetOpen = open;
    afterNextRender(() => this.map.invalidateSize(), { injector: this.injector });
  }

  // ---------- the plaque card ----------

  selectPlaque(plaque: any, fromMarker: boolean = false) {
    this.selected = plaque;
    this.clearRoute();
    this.updateHighlight();
    this.toggleSheet(true);
    if (fromMarker) {
      afterNextRender(() => document.getElementById('row-' + plaque._id)?.scrollIntoView({ block: 'nearest' }),
                      { injector: this.injector });
    }
    const [lng, lat] = plaque.location.coordinates;
    if (!this.map.getBounds().contains([lat, lng])) {
      this.map.panTo([lat, lng]);
    }
  }

  closePlaque() {
    this.selected = null;
    this.clearRoute();
    this.updateHighlight();
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
        this.routeLine = decodePolyline(leg.shape, 6);
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

  startWalking() {
    this.routeLayer.clearLayers();
    L.polyline(this.routeLine, { className: 'route-casing', weight: 9 }).addTo(this.routeLayer);
    const path = L.polyline(this.routeLine, { className: 'route-line', weight: 5 }).addTo(this.routeLayer);
    this.map.fitBounds(path.getBounds(), { padding: [60, 60] });
    this.routeShown = true;
    this.toggleSheet(false);
  }

  clearRoute() {
    this.routeLayer.clearLayers();
    this.route = null;
    this.routeLine = [];
    this.routeShown = false;
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

  // "Charles Dickens blue plaque" -> "Charles Dickens"
  nameOf(plaque: any): string {
    const title = this.titleOf(plaque);
    const suffix = ' ' + plaque.colour + ' plaque';
    return title.toLowerCase().endsWith(suffix) ? title.slice(0, -suffix.length) : title;
  }

  colourOf(plaque: any): string {
    return plaqueColour(plaque);
  }

  // "48 Doughty Street · Camden · Writers"
  placeLine(plaque: any): string {
    return [street(plaque), plaque.borough, categoryLabel(plaque)].filter(part => part).join(' · ');
  }

  // "40 m" close by, "1.4 km" further away
  distanceText(metres: number): string {
    return metres < 1000 ? Math.round(metres / 10) * 10 + ' m' : (metres / 1000).toFixed(1) + ' km';
  }

  letterOf(plaque: any): string {
    return MARKER_LETTERS[plaque.colour] || 'O';
  }

  textElement(text: string): HTMLElement {
    const span = document.createElement('span');
    span.textContent = text;
    return span;
  }
}
