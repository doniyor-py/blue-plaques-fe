import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe, DatePipe, DecimalPipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, SlicePipe, DatePipe, DecimalPipe],
  templateUrl: './profile.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  user: any = null;
  stats: any = null;
  progress: any[] = [];
  favourites: any[] = [];
  plaquesVisited: number = 0;
  showAllBoroughs: boolean = false;
  loading: boolean = true;
  error: string = '';

  myVisits: any[] = [];
  myVisitsTotal: number = 0;
  myVisitsPage: number = 1;
  myVisitsPages: number = 0;
  reviewedOnly: boolean = false;
  visitsLoading: boolean = false;
  visitsError: string = '';
  favouritesError: string = '';
  pageSize: number = 5;

  constructor(private userService: UserService) {}

  ngOnInit() {
    forkJoin({
      user: this.userService.getMe(),
      stats: this.userService.getStats(),
      progress: this.userService.getProgress()
    }).subscribe({
      next: ({ user, stats, progress }) => {
        this.user = user;
        this.stats = stats;
        this.progress = progress;
        this.plaquesVisited = progress.reduce((sum, borough) => sum + borough.visited, 0);
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Could not load your profile.';
        this.loading = false;
      }
    });
    this.loadFavourites();
    this.loadMyVisits(1);
  }

  loadMyVisits(page: number) {
    this.visitsLoading = true;
    this.visitsError = '';
    this.userService.getMyVisits(page, this.pageSize, this.reviewedOnly).subscribe({
      next: (response) => {
        this.myVisits = page === 1 ? response.visits : [...this.myVisits, ...response.visits];
        this.myVisitsTotal = response.total;
        this.myVisitsPage = response.page;
        this.myVisitsPages = response.pages;
        this.visitsLoading = false;
      },
      error: () => {
        this.visitsError = 'Could not load your visits. Please try again later.';
        this.visitsLoading = false;
      }
    });
  }

  showReviewedOnly(value: boolean) {
    if (this.reviewedOnly === value) { return; }
    this.reviewedOnly = value;
    this.loadMyVisits(1);
  }

  overall(visit: any): number {
    const r = visit.ratings;
    return (r.history + r.condition + r.accessibility) / 3;
  }

  loadFavourites() {
    this.favouritesError = '';
    this.userService.getFavourites().subscribe({
      next: (response) => this.favourites = response,
      error: () => this.favouritesError = 'Could not load your favourites. Please try again later.'
    });
  }

  removeFavourite(plaque: any) {
    const position = this.favourites.indexOf(plaque);
    this.favourites = this.favourites.filter(f => f._id !== plaque._id);
    this.userService.removeFavourite(plaque._id).subscribe({
      error: (err) => {
        this.favourites = [...this.favourites.slice(0, position), plaque, ...this.favourites.slice(position)];
        this.error = err.error?.error || 'Could not remove the favourite.';
      }
    });
  }

  visitedBoroughs(): any[] {
    return this.progress.filter(b => b.visited > 0);
  }

  visibleBoroughs(): any[] {
    return this.showAllBoroughs ? this.visitedBoroughs() : this.visitedBoroughs().slice(0, 5);
  }

  barWidth(borough: any): number {
    return borough.visited > 0 ? Math.max(borough.percent, 2) : 0;
  }
}
