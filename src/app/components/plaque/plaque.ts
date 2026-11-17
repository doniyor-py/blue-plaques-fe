import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlaqueService } from '../../services/plaque-service';
import { VisitService } from '../../services/visit-service';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-plaque',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './plaque.html',
  styleUrl: './plaque.css'
})
export class Plaque implements OnInit {
  plaque: any = null;
  loading: boolean = true;
  error: string = '';

  plaqueId: string = '';
  visits: any[] = [];
  visitForm: FormGroup;
  editingVisitId: string | null = null;
  visitError: string = '';
  visitMessage: string = '';
  saving: boolean = false;

  ratingFields = [
    { key: 'history', label: 'Historical interest' },
    { key: 'condition', label: 'Condition' },
    { key: 'accessibility', label: 'Accessibility' }
  ];

  constructor(private route: ActivatedRoute,
              private plaqueService: PlaqueService,
              private location: Location,
              private visitService: VisitService,
              public authService: AuthService,
              private formBuilder: FormBuilder) {
    this.visitForm = this.formBuilder.group({
      history: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      condition: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      accessibility: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      note: ['', Validators.maxLength(500)]
    });
  }

  ngOnInit() {
    this.plaqueId = this.route.snapshot.paramMap.get('id')!;
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
    // GET /visits, not GET /plaques/:id, so reloading the list does not add another view
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
}

