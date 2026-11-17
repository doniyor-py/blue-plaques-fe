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

  message: string = '';

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

  deleteUser(user: any) {
    if (!confirm('Delete ' + user.username + '? Their visits will be deleted too. This cannot be undone.')) {
      return;
    }
    this.message = '';
    this.error = '';
    this.userService.deleteUser(user.username).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.username !== user.username);
        this.total--;
        this.message = user.username + ' was deleted.';
      },
      error: (err) => this.error = err.error?.error || 'Could not delete the user.'
    });
  }
}
