import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, SlicePipe],
  templateUrl: './profile.html',
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
  }

  loadFavourites() {
    this.userService.getFavourites().subscribe({
      next: (response) => this.favourites = response
    });
  }

  removeFavourite(plaque: any) {
    this.userService.removeFavourite(plaque._id).subscribe({
      next: () => this.favourites = this.favourites.filter(f => f._id !== plaque._id),
      error: (err) => this.error = err.error?.error || 'Could not remove the favourite.'
    });
  }

  visibleBoroughs(): any[] {
    return this.showAllBoroughs ? this.progress : this.progress.filter(b => b.visited > 0);
  }

  barWidth(borough: any): number {
    return borough.visited > 0 ? Math.max(borough.percent, 2) : 0;
  }
}
