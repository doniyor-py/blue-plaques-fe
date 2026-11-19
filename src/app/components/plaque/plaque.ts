import { Component, OnInit, Injector, afterNextRender } from '@angular/core';
import { Location, DatePipe, DecimalPipe, formatDate } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlaqueService } from '../../services/plaque-service';
import { VisitService } from '../../services/visit-service';
import { AuthService } from '../../services/auth-service';
import { UserService } from '../../services/user-service';
import { ReportService } from '../../services/report-service';
import { PlaquePhotos } from '../plaque-photos/plaque-photos';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-plaque',
  imports: [ReactiveFormsModule, RouterLink, PlaquePhotos, DatePipe, DecimalPipe],
  templateUrl: './plaque.html',
  styleUrl: './plaque.css'
})
export class Plaque implements OnInit {
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
  reportMessage: string = '';
  reportError: string = '';
  reportSending: boolean = false;

  ratingFields = [
    { key: 'history', label: 'Historical interest' },
    { key: 'condition', label: 'Condition' },
    { key: 'accessibility', label: 'Accessibility' }
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
              private titleService: Title) {
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
    this.plaqueId = this.route.snapshot.paramMap.get('id')!;
    if (this.authService.isLoggedIn()) {
      this.checkFavourite();
    }
    this.plaqueService.getPlaque(this.plaqueId).subscribe({
      next: (response) => {
        this.plaque = response;
        this.loading = false;
        this.titleService.setTitle(response.title + ' | Blue Plaques Explorer');
        this.loadVisits(true);
      },
      error: (err) => {
        this.error = err.status === 404 ? 'Plaque not found.' : 'Could not load this plaque.';
        this.loading = false;
      }
    });
  }

  goBack() {
    this.location.back();
  }

  // ---------- visits ----------

  // GET /visits, not GET /plaques/:id
  loadVisits(openFromLink: boolean = false) {
    this.visitService.getVisits(this.plaqueId).subscribe({
      next: (response) => {
        this.visits = response.visits;
        this.visitsTotal = response.total;
        if (openFromLink) {
          this.openVisitFromLink();
        }
      }
    });
  }

  // /plaques/:id?visit=<id> (from "My visits" on the profile) jumps to that visit;
  openVisitFromLink() {
    const visitId = this.route.snapshot.queryParamMap.get('visit');
    if (!visitId) { return; }
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
        this.loadVisits();
      },
      error: (err) => {
        this.checkInError = err.error?.error || 'Could not save your visit.';
        this.checkingIn = false;
      }
    });
  }

  // Rate this plaque
  reviewNewVisit() {
    const visit = this.visits.find(v => v._id === this.justVisitedId);
    this.justVisitedId = null;
    if (visit) {
      this.startReview(visit);
    }
  }

  // Add a photo
  goToPhotos() {
    this.justVisitedId = null;
    document.getElementById('photos-heading')?.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('photo-file')?.focus({ preventScroll: true });
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
    const question = visit.ratings ? 'Delete this visit and its review?' : 'Delete this visit?';
    if (!confirm(question)) { return; }
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
      next: (user) => this.isFavourite = (user.favourites || []).includes(this.plaqueId)
    });
  }

  toggleFavourite() {
    this.favouriteBusy = true;
    this.favouriteError = '';
    const request = this.isFavourite
      ? this.userService.removeFavourite(this.plaqueId)
      : this.userService.addFavourite(this.plaqueId);

    request.subscribe({
      next: () => {
        this.isFavourite = !this.isFavourite;
        this.favouriteBusy = false;
      },
      error: (err) => {
        this.favouriteError = err.error?.error || 'Could not update your favourites.';
        this.favouriteBusy = false;
      }
    });
  }

  // ---------- reports ----------

  toggleReportForm() {
    this.showReportForm = !this.showReportForm;
    this.reportError = '';
    this.reportMessage = '';
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
        this.reportMessage = response.message;     // message: "Thanks, an admin will check it"
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
    if (!confirm('Delete this plaque? This also removes its photos, reports and favourites.')) { return; }
    this.plaqueService.deletePlaque(this.plaqueId).subscribe({
      next: () => this.router.navigate(['/plaques']),
      error: (err) => this.error = err.error?.error || 'Could not delete the plaque.'
    });
  }
}
