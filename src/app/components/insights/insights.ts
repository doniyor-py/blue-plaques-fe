import { Component, OnInit } from '@angular/core';
import { DecimalPipe, SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AnalyticsService } from '../../services/analytics-service';

@Component({
  selector: 'app-insights',
  imports: [DecimalPipe, SlicePipe, RouterLink],
  templateUrl: './insights.html',
  styleUrl: './insights.css'
})
export class Insights implements OnInit {
  boroughs: any[] = [];
  decades: any[] = [];
  professions: any[] = [];
  ratings: any[] = [];
  topRated: any[] = [];
  ages: any = null;

  totalPlaques: number = 0;
  totalVisits: number = 0;
  maxBorough: number = 1;
  maxDecade: number = 1;
  maxProfession: number = 1;

  showAllBoroughs: boolean = false;
  showAllRatings: boolean = false;
  showDecadeTable: boolean = false;
  loading: boolean = true;
  error: string = '';

  roleLabels: Record<string, string> = {
    'literature': 'Literature',
    'art-design': 'Art & design',
    'film-tv-theatre': 'Film, TV & theatre',
    'music': 'Music',
    'politics-military': 'Politics & military',
    'science-medicine': 'Science & medicine',
    'royalty': 'Royalty',
    'sport': 'Sport',
    'other': 'Other'
  };

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit() {
    forkJoin({
      boroughs: this.analyticsService.getBoroughs(),
      decades: this.analyticsService.getDecades(),
      professions: this.analyticsService.getProfessions(),
      ratings: this.analyticsService.getRatings(),
      topRated: this.analyticsService.getTopRated(3, 10),
      ages: this.analyticsService.getAges()
    }).subscribe({
      next: (data) => {
        this.boroughs = data.boroughs.filter(b => b.borough);
        this.decades = data.decades;
        this.professions = data.professions;
        this.ratings = data.ratings.filter(r => r.borough);
        this.topRated = data.topRated;
        this.ages = data.ages;

        this.totalPlaques = this.boroughs.reduce((sum, b) => sum + b.plaques, 0);
        this.totalVisits = this.ratings.reduce((sum, r) => sum + r.visits, 0);
        this.maxBorough = Math.max(1, ...this.boroughs.map(b => b.plaques));
        this.maxDecade = Math.max(1, ...this.decades.map(d => d.plaques));
        this.maxProfession = Math.max(1, ...this.professions.map(p => p.people));
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load the statistics. Is the API running?';
        this.loading = false;
      }
    });
  }

  visibleBoroughs(): any[] {
    return this.showAllBoroughs ? this.boroughs : this.boroughs.slice(0, 10);
  }

  visibleRatings(): any[] {
    return this.showAllRatings ? this.ratings : this.ratings.slice(0, 8);
  }

  barWidth(value: number, max: number): string {
    return 'calc((100% - 3.5rem) * ' + (value / max).toFixed(4) + ')';
  }

  percentOf(value: number, max: number): number {
    return max > 0 ? (value / max) * 100 : 0;
  }

  showDecadeLabel(index: number): boolean {
    const every = this.decades.length > 20 ? 3 : this.decades.length > 12 ? 2 : 1;
    return index % every === 0;
  }

  roleLabel(role: string): string {
    return this.roleLabels[role] || role;
  }
}
