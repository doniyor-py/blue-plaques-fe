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
  page: number = 1;
  pages: number = 1;
  pageSize: number = 20;
  loading: boolean = true;
  message: string = '';
  loadError: string = '';            // the list couldn't load: nothing to show
  actionError: string = '';          // one delete failed: keep showing the list
  deleting: string | null = null;    // username being deleted right now

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.loadError = '';
    this.userService.getUsers(this.page, this.pageSize).subscribe({
      next: (response) => {
        this.users = response.users;
        this.total = response.total;
        this.pages = response.pages;
        this.loading = false;
      },
      error: (err) => {
        this.loadError = err.error?.error || 'Could not load users.';
        this.loading = false;
      }
    });
  }

  deleteUser(user: any) {
    if (!confirm('Delete ' + user.username + '? Their visits, reviews and photos will be deleted too. This cannot be undone.')) {
      return;
    }
    this.message = '';
    this.actionError = '';
    this.deleting = user.username;
    this.userService.deleteUser(user.username).subscribe({
      next: () => {
        this.deleting = null;
        this.message = user.username + ' was deleted.';
        // if that was the only user on this page, go back a page
        if (this.users.length === 1 && this.page > 1) {
          this.page--;
        }
        this.loadUsers();     // reload so the page fills up and the total is right
      },
      error: (err) => {
        this.deleting = null;
        this.actionError = err.error?.error || 'Could not delete ' + user.username + '.';
      }
    });
  }

  previousPage() {
    if (this.page > 1) { this.page--; this.loadUsers(); }
  }

  nextPage() {
    if (this.page < this.pages) { this.page++; this.loadUsers(); }
  }
}
