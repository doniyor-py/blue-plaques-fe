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

  constructor(private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private zone: NgZone) {}

  ngAfterViewInit() {
    this.renderButton();
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  renderButton() {
    if (this.destroyed) { return; }
    // Google's script loads in the background: wait for it, but give up after about 10 seconds
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
    google.accounts.id.renderButton(this.buttonBox.nativeElement, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      width: Math.min(this.buttonBox.nativeElement.offsetWidth || 300, 400)
    });
  }

  // Google has checked who the person is and given us a signed "ID token" (the credential)
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
