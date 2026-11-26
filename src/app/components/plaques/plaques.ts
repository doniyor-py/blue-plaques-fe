import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { PlaqueService } from '../../services/plaque-service';
import { PlaqueCard } from '../plaque-card/plaque-card';
import { CATEGORY_LABELS } from '../../plaque-text';

@Component({
  selector: 'app-plaques',
  imports: [RouterLink, ReactiveFormsModule, TitleCasePipe, PlaqueCard],
  templateUrl: './plaques.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './plaques.css'
})
export class Plaques implements OnInit {
  plaque_list: any[] = [];
  page: number = 1;
  pages: number = 1;
  total: number = 0;
  pageSize: number = 12;
  loading: boolean = true;
  error: string = '';
  filters: any = {};
  filterKeys = ['q', 'borough', 'colour', 'category', 'from_year', 'to_year'];
  filtersOpen: boolean = false;

  boroughs: string[] = [];
  colours: string[] = [];

  // the five from the design (with icons) first, then the rest of the API's categories
  categories = [
    { value: 'literature', icon: 'M3 13l1.5-5L10 2.5 13.5 6 8 11.5zM3 13l3.5-3.5' },
    { value: 'science-medicine', icon: 'M6 2h4M7 2v4.5L3.2 12.6A1 1 0 0 0 4 14h8a1 1 0 0 0 .8-1.4L9 6.5V2' },
    { value: 'music', icon: 'M6 12V3.5l7-1.5v8.5M6 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM13 10.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z' },
    { value: 'politics-military', icon: 'M2 6l6-4 6 4zM3.5 7v5M6.5 7v5M9.5 7v5M12.5 7v5M2 14h12' },
    { value: 'art-design', icon: 'M8 2a6 6 0 1 0 0 12c1 0 1.4-.8.9-1.5-.6-.8 0-1.8 1-1.8H12a2 2 0 0 0 2-2A6 6 0 0 0 8 2z' },
    { value: 'film-tv-theatre', icon: '' },
    { value: 'royalty', icon: '' },
    { value: 'sport', icon: '' },
    { value: 'other', icon: '' }
  ];
  categoryLabels = CATEGORY_LABELS;

  filterForm: FormGroup;

  constructor(private plaqueService: PlaqueService,
              private route: ActivatedRoute,
              private router: Router,
              private formBuilder: FormBuilder) {
    this.filterForm = this.formBuilder.group({
      q: '', borough: '', colour: '', from_year: '', to_year: ''
    });
  }

  ngOnInit() {
    this.plaqueService.getBoroughs().subscribe({ next: (list) => this.boroughs = list });
    this.plaqueService.getColours().subscribe({ next: (list) => this.colours = list });
    this.route.queryParamMap.subscribe(params => {
      this.page = Number(params.get('page')) || 1;
      this.filters = {};
      for (const key of this.filterKeys) {
        const value = params.get(key);
        if (value) { this.filters[key] = value; }
      }
      this.filterForm.setValue({
        q: this.filters.q || '', borough: this.filters.borough || '', colour: this.filters.colour || '',
        from_year: this.filters.from_year || '', to_year: this.filters.to_year || ''
      });
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

  private showFilters(filters: any) {
    const queryParams: any = {};
    for (const key of this.filterKeys) {
      if (filters[key]) { queryParams[key] = filters[key]; }
    }
    this.router.navigate(['/plaques'], { queryParams: queryParams });
  }

  onSearch() {
    this.showFilters({ ...this.filterForm.value, category: this.filters.category });
  }

  toggleCategory(category: string) {
    this.showFilters({ ...this.filters, category: this.filters.category === category ? '' : category });
  }

  removeFilter(key: string) {
    this.showFilters({ ...this.filters, [key]: '' });
  }

  clearFilters() {
    this.router.navigate(['/plaques']);
  }

  activeFilters(): { key: string, label: string }[] {
    const labels: any = {
      q: `“${this.filters.q}”`,
      borough: this.filters.borough,
      category: this.categoryLabels[this.filters.category] || this.filters.category,
      colour: this.filters.colour ? this.titleCase(this.filters.colour) + ' plaques' : '',
      from_year: 'From ' + this.filters.from_year,
      to_year: 'To ' + this.filters.to_year
    };
    return this.filterKeys.filter(key => this.filters[key]).map(key => ({ key: key, label: labels[key] }));
  }

  filterCount(): number {
    return this.activeFilters().filter(filter => filter.key !== 'q').length;
  }

  summary(): string {
    const where = this.activeFilters().filter(filter => filter.key !== 'q').map(filter => filter.label);
    let text = this.filters.q ? ` match “${this.filters.q}”` : '';
    if (where.length) { text += (this.filters.borough ? ' in ' : ' · ') + where.join(' · '); }
    return text;
  }

  private titleCase(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
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
