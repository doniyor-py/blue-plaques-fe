import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PlaqueService } from '../../services/plaque-service';

@Component({
  selector: 'app-plaque-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './plaque-form.html',
  styleUrl: './plaque-form.css'
})
export class PlaqueForm implements OnInit {
  plaqueId: string | null = null;      // null = creating a new plaque
  currentYear = new Date().getFullYear();
  plaqueForm: FormGroup;
  boroughs: string[] = [];
  colours = ['blue', 'green', 'brown', 'black', 'red', 'white', 'grey', 'bronze', 'stone'];
  categories = ['literature', 'art-design', 'film-tv-theatre', 'music', 'politics-military',
                'science-medicine', 'royalty', 'sport', 'other'];
  loading: boolean = false;
  saving: boolean = false;
  error: string = '';

  constructor(private formBuilder: FormBuilder,
              private plaqueService: PlaqueService,
              private route: ActivatedRoute,
              private router: Router) {
    this.plaqueForm = this.formBuilder.group({
      title: ['', Validators.maxLength(200)],
      inscription: ['', [Validators.required, Validators.maxLength(5000)]],
      colour: ['blue', Validators.required],
      category: ['other'],
      erected_year: ['', [Validators.required, Validators.min(1800), Validators.max(this.currentYear)]],
      organisation: ['', [Validators.required, Validators.maxLength(200)]],
      address: ['', [Validators.required, Validators.maxLength(200)]],
      borough: ['', Validators.required],
      lat: ['', [Validators.required, Validators.min(51.2), Validators.max(51.8)]],
      lng: ['', [Validators.required, Validators.min(-0.6), Validators.max(0.4)]]
    });
  }

  ngOnInit() {
    this.plaqueService.getBoroughs().subscribe({
      next: (response) => this.boroughs = response
    });

    this.plaqueId = this.route.snapshot.paramMap.get('id');
    if (this.plaqueId) {
      this.loadPlaque(this.plaqueId);
    }
  }

  loadPlaque(id: string) {
    // when editing, these can stay empty: the API only changes the fields we send
    for (const field of ['erected_year', 'organisation', 'address', 'borough']) {
      const control = this.plaqueForm.get(field)!;
      control.removeValidators(Validators.required);
      control.updateValueAndValidity();
    }

    this.loading = true;
    this.plaqueService.getPlaque(id, false).subscribe({
      next: (plaque) => {
        if (plaque.colour && !this.colours.includes(plaque.colour)) {
          this.colours.push(plaque.colour);      // keep rarer colours like "brass" selectable
        }
        this.plaqueForm.patchValue({
          title: plaque.title,
          inscription: plaque.inscription,
          colour: plaque.colour,
          category: plaque.category || 'other',
          erected_year: plaque.erected_year ?? '',
          organisation: plaque.organisation ?? '',
          address: plaque.address ?? '',
          borough: plaque.borough ?? '',
          lat: plaque.location?.coordinates[1] ?? '',
          lng: plaque.location?.coordinates[0] ?? ''
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load this plaque.';
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.plaqueForm.invalid) {
      this.plaqueForm.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.error = '';

    const request = this.plaqueId
      ? this.plaqueService.updatePlaque(this.plaqueId, this.plaqueForm.value)
      : this.plaqueService.createPlaque(this.plaqueForm.value);

    request.subscribe({
      next: (response) => {
        // the API answers { url: ".../plaques/<id>" }, so the id is the last part
        const id = this.plaqueId || response.url.split('/').pop();
        this.router.navigate(['/plaques', id]);
      },
      error: (err) => {
        this.error = err.error?.error || 'Could not save the plaque.';
        this.saving = false;
      }
    });
  }

  isInvalid(field: string): boolean {
    const control = this.plaqueForm.get(field)!;
    return control.invalid && control.touched;
  }
}
