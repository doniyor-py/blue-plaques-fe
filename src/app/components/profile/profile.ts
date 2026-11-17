import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  user: any = null;
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
  }
}
