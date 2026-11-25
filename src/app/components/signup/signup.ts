import { Component, AfterViewInit, OnDestroy, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { maxBytes } from '../../validators/max-bytes';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { TURNSTILE_SITE_KEY } from '../../api';
import { ScriptLoader, TURNSTILE_SCRIPT } from '../../services/script-loader';
import { GoogleButton } from '../google-button/google-button';
import { passwordsMatch } from '../../validators/passwords-match';

declare const turnstile: any;

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink, GoogleButton],
  templateUrl: './signup.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './signup.css'
})
export class Signup implements AfterViewInit, OnDestroy {
  step: 'details' | 'code' = 'details';
  detailsForm: FormGroup;
  codeForm: FormGroup;
  captchaToken: string = '';
  widgetId: any = null;
  showPassword: boolean = false;
  error: string = '';
  message: string = '';
  loading: boolean = false;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private router: Router,
              private zone: NgZone,
              private scriptLoader: ScriptLoader) {
    this.detailsForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]{3,20}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), maxBytes(72)]],
      confirm_password: ['', Validators.required],
      accept_terms: [false, Validators.requiredTrue]
    }, { validators: passwordsMatch('password', 'confirm_password') });
    this.codeForm = this.formBuilder.group({
      code: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
    });
  }

  ngAfterViewInit() {
    this.scriptLoader.load(TURNSTILE_SCRIPT)
      .then(() => this.renderCaptcha())
      .catch(() => this.error = 'The human check could not load. Please check your connection and refresh the page.');
  }

  ngOnDestroy() {
    this.removeCaptcha();
  }

  renderCaptcha() {
    if (typeof turnstile === 'undefined' || !document.getElementById('turnstile-box')) {
      return;
    }
    this.widgetId = turnstile.render('#turnstile-box', {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token: string) => this.zone.run(() => this.captchaToken = token),
      'expired-callback': () => this.zone.run(() => this.captchaToken = '')
    });
  }

  removeCaptcha() {
    if (this.widgetId !== null && typeof turnstile !== 'undefined') {
      turnstile.remove(this.widgetId);
      this.widgetId = null;
    }
    this.captchaToken = '';
  }

  passwordTooLong(): boolean {
    return this.detailsForm.get('password')!.hasError('maxBytes');
  }

  passwordLength(): number {
    return (this.detailsForm.value.password || '').length;
  }

  onRegister() {
    this.error = '';
    if (this.detailsForm.invalid) {
      this.detailsForm.markAllAsTouched();
      return;
    }
    if (!this.captchaToken) {
      this.error = 'Please complete the human check.';
      return;
    }
    this.loading = true;
    const { username, email, password, accept_terms } = this.detailsForm.value;

    this.authService.register(username, email, password, this.captchaToken, accept_terms).subscribe({
      next: () => {
        this.removeCaptcha();
        this.step = 'code';
        this.message = 'We have emailed a 6-digit code to ' + email + '. It expires in 10 minutes.';
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Could not sign up. Please try again.';
        this.loading = false;
        turnstile.reset(this.widgetId);
        this.captchaToken = '';
      }
    });
  }

  onVerify() {
    this.error = '';
    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.authService.verifyRegistration(this.detailsForm.value.email, this.codeForm.value.code).subscribe({
      next: () => this.router.navigate(['/login'], { queryParams: { notice: 'registered' } }),
      error: (err) => {
        this.error = err.error?.error || 'Could not check the code.';
        this.loading = false;
      }
    });
  }

  startAgain() {
    this.step = 'details';
    this.error = '';
    this.message = '';
    this.codeForm.reset();
    setTimeout(() => this.renderCaptcha());
  }

  passwordsDontMatch(): boolean {
    return this.detailsForm.hasError('passwordsDontMatch') && this.detailsForm.get('confirm_password')!.touched;
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const control = form.get(field)!;
    return control.invalid && control.touched;
  }
}
