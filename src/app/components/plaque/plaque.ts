import { Component, OnInit, Injector, ViewChild, afterNextRender, ChangeDetectionStrategy } from '@angular/core';
import { Location, DatePipe, DecimalPipe, formatDate } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlaqueService } from '../../services/plaque-service';
import { VisitService } from '../../services/visit-service';
import { AuthService } from '../../services/auth-service';
import { UserService } from '../../services/user-service';
import { ReportService } from '../../services/report-service';
import { PlaquePhotos } from '../plaque-photos/plaque-photos';
import { PlaqueRoundel } from '../plaque-roundel/plaque-roundel';
import { plaqueName, categoryLabel, plaqueColour, initials, CATEGORY_LABELS } from '../../plaque-text';
import { ConfirmService } from '../../services/confirm-service';
import { ToastService } from '../../services/toast-service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-plaque',
  imports: [ReactiveFormsModule, RouterLink, PlaquePhotos, PlaqueRoundel, DatePipe, DecimalPipe],
  templateUrl: './plaque.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './plaque.css'
})
export class Plaque implements OnInit {
  @ViewChild(PlaquePhotos) photosSection?: PlaquePhotos;

  plaque: any = null;
  loading: boolean = true;
  error: string = '';
  isFavourite: boolean = false;
  favouriteBusy: boolean = false;
  favouriteError: string = '';

  plaqueId: string = '';
  visits: any[] = [];
  visitsTotal: number = 0;
  visitsShown: number = 5;
  visitError: string = '';
  visitMessage: string = '';

  checkingIn: boolean = false;
  checkInError: string = '';
  justVisitedId: string | null = null;
  highlightedVisitId: string | null = null;

  reviewForm: FormGroup;
  reviewingVisitId: string | null = null;
  saving: boolean = false;

  showReportForm: boolean = false;
  reportForm: FormGroup;
  reportError: string = '';
  reportSending: boolean = false;

  // walking time, only when the browser already has permission to share the location
  walkMinutes: number | null = null;
  walkKm: string = '';
  arriveAt: Date | null = null;

  ratingFields = [
    { key: 'history', label: 'Historical interest', short: 'Interest' },
    { key: 'condition', label: 'Condition', short: 'Condition' },
    { key: 'accessibility', label: 'Accessibility', short: 'Access' }
  ];
  stars = [1, 2, 3, 4, 5];

  reportTypes = [
    { value: 'missing', label: 'The plaque is missing' },
    { value: 'damaged', label: 'The plaque is damaged' },
    { value: 'wrong_info', label: 'The information is wrong' },
    { value: 'other', label: 'Something else' }
  ];

  constructor(private route: ActivatedRoute,
              private plaqueService: PlaqueService,
              private location: Location,
              private visitService: VisitService,
              public authService: AuthService,
              private formBuilder: FormBuilder,
              private userService: UserService,
              private reportService: ReportService,
              private router: Router,
              private injector: Injector,
              private titleService: Title,
              private confirmService: ConfirmService,
              private toastService: ToastService) {
    this.reviewForm = this.formBuilder.group({
      history: [null, Validators.required],
      condition: [null, Validators.required],
      accessibility: [null, Validators.required],
      note: ['', Validators.maxLength(500)]
    });

    this.reportForm = this.formBuilder.group({
      type: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]]
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.plaqueId = params.get('id')!;
      this.loadPlaque();
    });
  }

  loadPlaque() {
    this.plaque = null;
    this.loading = true;
    this.error = '';
    this.isFavourite = false;
    this.visits = [];
    this.visitsTotal = 0;
    this.visitsShown = 5;
    this.justVisitedId = null;
    this.highlightedVisitId = null;
    this.reviewingVisitId = null;
    this.checkInError = '';
    this.visitMessage = '';
    this.visitError = '';
    this.showReportForm = false;
    this.reportError = '';
    this.walkMinutes = null;

    if (this.authService.isLoggedIn()) {
      this.checkFavourite();
    }
    this.plaqueService.getPlaque(this.plaqueId).subscribe({
      next: (response) => {
        this.plaque = response;
        this.loading = false;
        this.titleService.setTitle(response.title + ' | Blue Plaques Explorer');
        this.openVisitFromLink();
        this.loadWalkTime();
      },
      error: (err) => {
        this.error = err.status === 404 ? 'Plaque not found.' : 'Could not load this plaque.';
        this.loading = false;
      }
    });
    this.loadVisits(true);
  }

  goBack() {
    this.location.back();
  }

  name(): string { return plaqueName(this.plaque); }
  category(): string { return categoryLabel(this.plaque); }
  colour(): string { return plaqueColour(this.plaque); }
  initials(name: string): string { return initials(name); }

  personLine(person: any): string {
    const years = person.born && person.died ? `${person.born}–${person.died}` : '';
    const roles = (person.roles || []).map((role: string) => CATEGORY_LABELS[role] || role);
    return [years, ...roles].filter(part => part).join(' · ');
  }

  scrollToNotes() {
    const heading = document.getElementById('visits-heading');
    heading?.scrollIntoView({ behavior: 'smooth' });
    heading?.focus({ preventScroll: true });
  }

  colourName(): string {
    const colour: string = this.plaque.colour || '';
    return colour ? colour.charAt(0).toUpperCase() + colour.slice(1) + ' plaque' : 'Plaque';
  }

  async loadWalkTime() {
    const coordinates = this.plaque?.location?.coordinates;
    if (!coordinates || !navigator.geolocation || !navigator.permissions) { return; }
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      if (status.state !== 'granted') { return; }
    } catch {
      return;
    }
    navigator.geolocation.getCurrentPosition(position => {
      const metres = this.distance(position.coords.latitude, position.coords.longitude, coordinates[1], coordinates[0]);
      this.walkMinutes = Math.max(1, Math.ceil(metres / 80));
      this.walkKm = (metres / 1000).toFixed(1);
      this.arriveAt = new Date(Date.now() + this.walkMinutes * 60000);
    }, () => this.walkMinutes = null, { maximumAge: 300000 });
  }

  private distance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const toRad = (degrees: number) => degrees * Math.PI / 180;
    const a = Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lng2 - lng1) / 2) ** 2;
    return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // ---------- visits ----------

  loadVisits(openFromLink: boolean = false) {
    this.visitService.getVisits(this.plaqueId).subscribe({
      next: (response) => {
        this.visits = response.visits;
        this.visitsTotal = response.total;
        if (openFromLink) {
          this.openVisitFromLink();
        }
      },
      error: (err) => {
        if (err.status !== 404) {
          this.visitError = 'Could not load the visits. Please try again later.';
        }
      }
    });
  }

  openVisitFromLink() {
    const visitId = this.route.snapshot.queryParamMap.get('visit');
    if (!visitId || !this.plaque) { return; }
    const index = this.visits.findIndex(v => v._id === visitId);
    if (index === -1) { return; }

    this.visitsShown = Math.max(this.visitsShown, index + 1);
    this.highlightedVisitId = visitId;
    if (this.route.snapshot.queryParamMap.get('review') === '1' && this.isMine(this.visits[index])) {
      this.startReview(this.visits[index]);
    } else {
      this.scrollToVisit(visitId);
    }
  }

  visibleVisits(): any[] {
    return this.visits.slice(0, this.visitsShown);
  }

  reviewCount(): number {
    return this.visits.filter(v => v.ratings).length;
  }

  averageRating(): number | null {
    const reviewed = this.visits.filter(v => v.ratings);
    if (reviewed.length === 0) { return null; }
    return reviewed.reduce((sum, v) => sum + v.overall, 0) / reviewed.length;
  }

  // average of one rating (history, condition or accessibility) across all reviews
  fieldAverage(key: string): number {
    const reviewed = this.visits.filter(v => v.ratings);
    return reviewed.reduce((sum, v) => sum + v.ratings[key], 0) / reviewed.length;
  }

  today(): string {
    return formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  }

  visitedToday(): boolean {
    return this.visits.some(v => this.isMine(v) && v.date === this.today());
  }

  checkIn() {
    this.checkingIn = true;
    this.checkInError = '';
    this.visitMessage = '';
    this.visitService.checkIn(this.plaqueId).subscribe({
      next: (response) => {
        this.checkingIn = false;
        this.justVisitedId = response._id;
        this.toastService.show({ text: 'Visit saved:', actions: [
          { label: 'rate it', run: () => this.reviewNewVisit() },
          { label: 'add a photo', run: () => this.goToPhotos() }
        ] });
        this.loadVisits();
      },
      error: (err) => {
        this.checkInError = err.error?.error || 'Could not save your visit.';
        this.checkingIn = false;
      }
    });
  }

  reviewNewVisit() {
    const visit = this.visits.find(v => v._id === this.justVisitedId);
    this.justVisitedId = null;
    if (visit) {
      this.startReview(visit);
    }
  }

  goToPhotos() {
    this.justVisitedId = null;
    document.getElementById('photos-heading')?.scrollIntoView({ behavior: 'smooth' });
    this.photosSection?.openUpload();
  }

  startReview(visit: any) {
    this.reviewingVisitId = visit._id;
    this.visitMessage = '';
    this.visitError = '';
    this.reviewForm.reset({
      history: visit.ratings?.history ?? null,
      condition: visit.ratings?.condition ?? null,
      accessibility: visit.ratings?.accessibility ?? null,
      note: visit.note || ''
    });
    this.scrollToVisit(visit._id);
  }

  cancelReview() {
    this.reviewingVisitId = null;
  }

  onSubmitReview() {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.visitError = '';
    const visitId = this.reviewingVisitId!;
    this.visitService.saveReview(this.plaqueId, visitId, this.reviewForm.value).subscribe({
      next: () => {
        this.saving = false;
        this.reviewingVisitId = null;
        this.highlightedVisitId = visitId;
        this.visitMessage = 'Thanks! Your review is saved.';
        this.loadVisits();
      },
      error: (err) => {
        this.visitError = err.error?.error || 'Could not save your review.';
        this.saving = false;
      }
    });
  }

  deleteVisit(visit: any) {
    this.confirmService.ask({
      title: visit.ratings ? 'Delete this visit and its review?' : 'Delete this visit?',
      message: 'It will be removed from this plaque and from your profile.',
      confirmText: 'Delete visit'
    }).subscribe(yes => {
      if (!yes) { return; }
      this.visitError = '';
      this.visitService.deleteVisit(this.plaqueId, visit._id).subscribe({
        next: () => {
          this.visitMessage = 'Visit deleted.';
          if (this.reviewingVisitId === visit._id) { this.reviewingVisitId = null; }
          if (this.justVisitedId === visit._id) { this.justVisitedId = null; }
          this.loadVisits();
        },
        error: (err) => this.visitError = err.error?.error || 'Could not delete the visit.'
      });
    });
  }

  isMine(visit: any): boolean {
    return visit.username === this.authService.getUsername();
  }

  canDelete(visit: any): boolean {
    return this.isMine(visit) || this.authService.isAdmin();
  }

  isInvalid(field: string): boolean {
    const control = this.reviewForm.get(field)!;
    return control.invalid && control.touched;
  }

  scrollToVisit(visitId: string) {
    afterNextRender(() => {
      document.getElementById('visit-' + visitId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, { injector: this.injector });
  }

  // ---------- favourites ----------

  checkFavourite() {
    this.userService.getMe().subscribe({
      next: (user) => this.isFavourite = (user.favourites || []).includes(this.plaqueId),
      error: () => this.isFavourite = false
    });
  }

  toggleFavourite() {
    const wasFavourite = this.isFavourite;
    this.isFavourite = !wasFavourite;
    this.favouriteBusy = true;
    this.favouriteError = '';
    const request = wasFavourite
      ? this.userService.removeFavourite(this.plaqueId)
      : this.userService.addFavourite(this.plaqueId);

    request.subscribe({
      next: () => {
        this.favouriteBusy = false;
        if (!wasFavourite) { this.toastService.show({ text: 'Saved to your favourites' }); }
      },
      error: (err) => {
        this.isFavourite = wasFavourite;
        this.favouriteError = err.error?.error || 'Could not update your favourites.';
        this.favouriteBusy = false;
      }
    });
  }

  // ---------- reports ----------

  toggleReportForm() {
    this.showReportForm = !this.showReportForm;
    this.reportError = '';
  }

  onSubmitReport() {
    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }
    this.reportSending = true;
    this.reportError = '';
    const { type, message } = this.reportForm.value;

    this.reportService.reportProblem(this.plaqueId, type, message.trim()).subscribe({
      next: (response) => {
        this.toastService.show({ text: response.message ? 'Report sent. ' + response.message : 'Report sent' });
        this.showReportForm = false;
        this.reportForm.reset({ type: '', message: '' });
        this.reportSending = false;
      },
      error: (err) => {
        this.reportError = err.error?.error || 'Could not send your report.';
        this.reportSending = false;
      }
    });
  }

  isReportInvalid(field: string): boolean {
    const control = this.reportForm.get(field)!;
    return control.invalid && control.touched;
  }

  // ---------- admin ----------

  deletePlaque() {
    this.confirmService.ask({
      title: 'Delete this plaque?',
      message: 'This also removes its visits, photos, reports and favourites. It cannot be undone.',
      confirmText: 'Delete plaque'
    }).subscribe(yes => {
      if (!yes) { return; }
      this.plaqueService.deletePlaque(this.plaqueId).subscribe({
        next: () => this.router.navigate(['/plaques']),
        error: (err) => this.error = err.error?.error || 'Could not delete the plaque.'
      });
    });
  }
}
