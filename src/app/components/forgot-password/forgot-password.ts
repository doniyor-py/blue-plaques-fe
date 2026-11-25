import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { maxBytes } from '../../validators/max-bytes';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { passwordsMatch } from '../../validators/passwords-match';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  step: 'email' | 'reset' = 'email';
  emailForm: FormGroup;
  resetForm: FormGroup;
  message: string = '';
  error: string = '';
  loading: boolean = false;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private router: Router) {
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.resetForm = this.formBuilder.group({
      code: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
      new_password: ['', [Validators.required, Validators.minLength(8), maxBytes(72)]],
      confirm_password: ['', Validators.required]
    }, { validators: passwordsMatch('new_password', 'confirm_password') });
  }

  sendCode() {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    this.authService.forgotPassword(this.emailForm.value.email).subscribe({
      next: (response) => {
        this.message = response.message;
        this.step = 'reset';
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Could not send the code. Please try again.';
        this.loading = false;
      }
    });
  }

  resetPassword() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    const { code, new_password } = this.resetForm.value;

    this.authService.resetPassword(this.emailForm.value.email, code, new_password).subscribe({
      next: () => this.router.navigate(['/login'], { queryParams: { notice: 'password-reset' } }),
      error: (err) => {
        this.error = err.error?.error || 'Could not reset your password.';
        this.loading = false;
      }
    });
  }

  startAgain() {
    this.step = 'email';
    this.error = '';
    this.message = '';
    this.resetForm.reset();
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const control = form.get(field)!;
    return control.invalid && control.touched;
  }

  passwordsDontMatch(): boolean {
    return this.resetForm.hasError('passwordsDontMatch') && this.resetForm.get('confirm_password')!.touched;
  }
}
