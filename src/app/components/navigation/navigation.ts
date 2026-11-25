import { Component, ElementRef, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-navigation',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navigation.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './navigation.css'
})
export class Navigation {
  menuOpen: boolean = false;
  adminOpen: boolean = false;

  constructor(public authService: AuthService,
              private router: Router,
              private host: ElementRef) {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.menuOpen = false;
      this.adminOpen = false;
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleAdmin() {
    this.adminOpen = !this.adminOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.host.nativeElement.contains(event.target)) {
      this.menuOpen = false;
      this.adminOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.menuOpen = false;
    this.adminOpen = false;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.finishLogout(),
      error: () => this.finishLogout()
    });
  }

  private finishLogout() {
    this.authService.removeToken();
    this.router.navigate(['/']);
  }
}
