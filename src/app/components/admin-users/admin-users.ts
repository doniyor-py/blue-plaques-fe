import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-admin-users',
  imports: [],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css'
})
export class AdminUsers implements OnInit {
  users: any[] = [];
  total: number = 0;
  loading: boolean = true;
  error: string = '';

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getUsers(1, 50).subscribe({
      next: (response) => {
        this.users = response.users;
        this.total = response.total;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Could not load users.';
        this.loading = false;
      }
    });
  }
}
