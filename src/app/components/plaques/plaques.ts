import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SlicePipe, TitleCasePipe } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { PlaqueService } from '../../services/plaque-service';

@Component({
  selector: 'app-plaques',
  imports: [SlicePipe, RouterLink, ReactiveFormsModule, TitleCasePipe],
  templateUrl: './plaques.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './plaques.css'
})
export class Plaques implements OnInit {
  plaque_list: any[] = [];
  page: number = 1;
  pages: number = 1;
  total: number = 0;
  pageSize: number = 10;
  loading: boolean = true;
  error: string = '';
  filters: any = {};
  filterKeys = ['q', 'borough', 'colour', 'category', 'from_year', 'to_year'];

  boroughs: string[] = [];

  categories = [
    { value: 'literature', label: 'Literature' },
    { value: 'art-design', label: 'Art & design' },
    { value: 'film-tv-theatre', label: 'Film, TV & theatre' },
    { value: 'music', label: 'Music' },
    { value: 'politics-military', label: 'Politics & military' },
    { value: 'science-medicine', label: 'Science & medicine' },
    { value: 'royalty', label: 'Royalty' },
    { value: 'sport', label: 'Sport' },
    { value: 'other', label: 'Other' }
  ];

  colours: string[] = [];

  filterForm: FormGroup;

  constructor(private plaqueService: PlaqueService,
              private route: ActivatedRoute,
              private router: Router,
              private formBuilder: FormBuilder) {
    this.filterForm = this.formBuilder.group({
      q: '', borough: '', colour: '', category: '', from_year: '', to_year: ''
    });
  }

  ngOnInit() {
    this.plaqueService.getBoroughs().subscribe({ next: (list) => this.boroughs = list });
    this.plaqueService.getColours().subscribe({ next: (list) => this.colours = list });
    this.route.queryParamMap.subscribe(params => {
      this.page = Number(params.get('page')) || 1;
      this.filters = {};
      const formValues: any = {};
      for (const key of this.filterKeys) {
        const value = params.get(key);
        if (value) { this.filters[key] = value; }
        formValues[key] = value || '';
      }
      this.filterForm.setValue(formValues);
      this.loadPage();
    });
  }

  loadPage() {
    this.loading = true;
    this.error = '';
    this.plaqueService.searchPlaques(this.filters, this.page, this.pageSize).subscribe({
      next: (response) => {
        this.plaque_list = response.plaques;
        this.pages = response.pages;
        this.total = response.total;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Could not load plaques. Is the API running?';
        this.loading = false;
      }
    });
  }

  onSearch() {
    const queryParams: any = {};
    for (const key of this.filterKeys) {
      const value = this.filterForm.value[key];
      if (value) { queryParams[key] = value; }
    }
    this.router.navigate(['/plaques'], { queryParams: queryParams });
  }

  clearFilters() {
    this.router.navigate(['/plaques']);
  }

  goToPage(page: number) {
    this.router.navigate(['/plaques'], { queryParams: { ...this.filters, page: page } });
  }

  previousPage() {
    if (this.page > 1) { this.goToPage(this.page - 1); }
  }

  nextPage() {
    if (this.page < this.pages) { this.goToPage(this.page + 1); }
  }
}
