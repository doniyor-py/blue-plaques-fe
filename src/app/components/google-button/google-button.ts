import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { GOOGLE_CLIENT_ID } from '../../api';

declare const google: any;

@Component({
  selector: 'app-google-button',
  imports: [RouterLink],
  templateUrl: './google-button.html',
  styleUrl: './google-button.css'
})
export class GoogleButton implements AfterViewInit, OnDestroy {
  @ViewChild('buttonBox') buttonBox!: ElementRef<HTMLDivElement>;

  loading: boolean = false;
  error: string = '';
  private attempts: number = 0;
  private destroyed: boolean = false;
  private lastWidth: number = 0;
  private resizeObserver: ResizeObserver | null = null;
  private resizeTimer: any = null;

  constructor(private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private zone: NgZone) {}

  ngAfterViewInit() {
    this.renderButton();
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.resizeObserver?.disconnect();
    clearTimeout(this.resizeTimer);
  }

  renderButton() {
    if (this.destroyed) { return; }
    if (typeof google === 'undefined' || !google.accounts?.id) {
      this.attempts++;
      if (this.attempts > 30) {
        this.error = 'Google sign-in could not load. You can still use the form below.';
        return;
      }
      setTimeout(() => this.renderButton(), 300);
      return;
    }
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: any) => this.zone.run(() => this.signIn(response.credential))
    });
    this.drawButton();

    this.resizeObserver = new ResizeObserver(() => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => this.drawButton(), 150);
    });
    this.resizeObserver.observe(this.buttonBox.nativeElement);
  }

  drawButton() {
    const box = this.buttonBox.nativeElement;
    const width = Math.max(200, Math.min(box.offsetWidth, 400));     // Google allows 200-400 px
    if (width === this.lastWidth) { return; }
    this.lastWidth = width;
    box.innerHTML = '';
    google.accounts.id.renderButton(box, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      width: width
    });
  }

  signIn(credential: string) {
    this.loading = true;
    this.error = '';
    this.authService.loginWithGoogle(credential).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.error = err.error?.error || 'Google sign-in failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
