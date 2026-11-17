import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, SlicePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  user: any = null;
  favourites: any[] = [];
  loading: boolean = true;
  error: string = '';

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getMe().subscribe({
      next: (response) => { this.user = response; this.loading = false; },
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
}
