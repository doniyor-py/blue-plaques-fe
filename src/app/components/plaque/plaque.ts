import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlaqueService } from '../../services/plaque-service';
import { VisitService } from '../../services/visit-service';
import { AuthService } from '../../services/auth-service';
import { UserService } from '../../services/user-service';
import { ReportService } from '../../services/report-service';
import { PlaquePhotos } from '../plaque-photos/plaque-photos';

@Component({
  selector: 'app-plaque',
  imports: [ReactiveFormsModule, RouterLink, PlaquePhotos],
  templateUrl: './plaque.html',
  styleUrl: './plaque.css'
})
export class Plaque implements OnInit {
  plaque: any = null;
  loading: boolean = true;
  error: string = ''
  isFavourite: boolean = false;
  favouriteBusy: boolean = false;
  favouriteError: string = '';


  plaqueId: string = '';
  visits: any[] = [];
  visitForm: FormGroup;
  editingVisitId: string | null = null;
  visitError: string = '';
  visitMessage: string = '';
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
              private router: Router) {
    this.visitForm = this.formBuilder.group({
      history: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      condition: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      accessibility: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
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
        this.visits = response.visits || [];
        this.loading = false;
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

  loadVisits() {
    this.visitService.getVisits(this.plaqueId).subscribe({
      next: (response) => this.visits = response
    });
  }

  onSubmitVisit() {
    if (this.visitForm.invalid) {
      this.visitForm.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.visitError = '';
    this.visitMessage = '';

    const isEdit = this.editingVisitId !== null;
    const request = isEdit
      ? this.visitService.editVisit(this.plaqueId, this.editingVisitId!, this.visitForm.value)
      : this.visitService.addVisit(this.plaqueId, this.visitForm.value);

    request.subscribe({
      next: () => {
        this.visitMessage = isEdit ? 'Your visit was updated.' : 'Thanks! Your visit was added.';
        this.saving = false;
        this.cancelEdit();
        this.loadVisits();
      },
      error: (err) => {
        this.visitError = err.error?.error || 'Could not save your visit.';
        this.saving = false;
      }
    });
  }

  startEdit(visit: any) {
    this.editingVisitId = visit._id;
    this.visitMessage = '';
    this.visitForm.setValue({
      history: visit.ratings.history,
      condition: visit.ratings.condition,
      accessibility: visit.ratings.accessibility,
      note: visit.note || ''
    });
  }

  cancelEdit() {
    this.editingVisitId = null;
    this.visitForm.reset({ history: 5, condition: 5, accessibility: 5, note: '' });
  }

  deleteVisit(visit: any) {
    if (!confirm('Delete this visit?')) { return; }
    this.visitError = '';
    this.visitService.deleteVisit(this.plaqueId, visit._id).subscribe({
      next: () => {
        this.visitMessage = 'Visit deleted.';
        this.loadVisits();
      },
      error: (err) => this.visitError = err.error?.error || 'Could not delete the visit.'
    });
  }

  canChange(visit: any): boolean {
    return visit.username === this.authService.getUsername() || this.authService.isAdmin();
  }

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
        this.reportMessage = response.message;     // "Thanks, an admin will check it"
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

  deletePlaque() {
    if (!confirm('Delete this plaque? This also removes its photos, reports and favourites.')) { return; }
    this.plaqueService.deletePlaque(this.plaqueId).subscribe({
      next: () => this.router.navigate(['/plaques']),
      error: (err) => this.error = err.error?.error || 'Could not delete the plaque.'
    });
  }
}

