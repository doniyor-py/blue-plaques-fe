import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { GoogleButton } from '../google-button/google-button';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, GoogleButton],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm: FormGroup;
  error: string = '';
  loading: boolean = false;
  notice: string = '';
  showPassword: boolean = false;

  notices: Record<string, string> = {
    'registered': 'Account created. You can now log in.',
    'password-changed': 'Password changed. Please log in with your new password.',
    'password-reset': 'Password reset. You can now log in with your new password.',
    'account-deleted': 'Your account has been deleted. Sorry to see you go!'
  };

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private route: ActivatedRoute,
              private router: Router) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    const key = this.route.snapshot.queryParamMap.get('notice');
    this.notice = key ? (this.notices[key] || '') : '';
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.error = err.error?.error || 'Could not log in. Is the API running?';
        this.loading = false;
      }
    });
  }

  isInvalid(field: string): boolean {
    const control = this.loginForm.get(field)!;
    return control.invalid && control.touched;
  }
}
