import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { maxBytes } from '../../validators/max-bytes';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user-service';
import { AuthService } from '../../services/auth-service';
import { passwordsMatch } from '../../validators/passwords-match';

@Component({
  selector: 'app-account',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './account.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './account.css'
})
export class Account implements OnInit {
  passwordForm: FormGroup;
  deleteForm: FormGroup;
  passwordError: string = '';
  passwordSaving: boolean = false;
  hasPassword: boolean = true;
  deleteError: string = '';
  deleting: boolean = false;

  constructor(private formBuilder: FormBuilder,
              private userService: UserService,
              public authService: AuthService,
              private router: Router) {
    this.passwordForm = this.formBuilder.group({
      old_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(8), maxBytes(72)]],
      confirm_password: ['', Validators.required]
    }, { validators: passwordsMatch('new_password', 'confirm_password') });

    this.deleteForm = this.formBuilder.group({
      password: ['', Validators.required],
      understand: [false, Validators.requiredTrue]
    });
  }

  ngOnInit() {
    this.userService.getMe().subscribe({
      next: (user) => this.hasPassword = user.password_set !== false
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.passwordSaving = true;
    this.passwordError = '';
    const { old_password, new_password } = this.passwordForm.value;

    this.userService.changePassword(old_password, new_password).subscribe({
      next: () => {
        this.authService.removeToken();
        this.router.navigate(['/login'], { queryParams: { notice: 'password-changed' } });
      },
      error: (err) => {
        this.passwordError = err.error?.error || 'Could not change your password.';
        this.passwordSaving = false;
      }
    });
  }

  deleteAccount() {
    if (this.deleteForm.invalid) {
      this.deleteForm.markAllAsTouched();
      return;
    }
    this.deleting = true;
    this.deleteError = '';

    this.userService.deleteAccount(this.deleteForm.value.password).subscribe({
      next: () => {
        this.authService.removeToken();
        this.router.navigate(['/login'], { queryParams: { notice: 'account-deleted' } });
      },
      error: (err) => {
        this.deleteError = err.error?.error || 'Could not delete your account.';
        this.deleting = false;
      }
    });
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const control = form.get(field)!;
    return control.invalid && control.touched;
  }

  passwordsDontMatch(): boolean {
    return this.passwordForm.hasError('passwordsDontMatch') && this.passwordForm.get('confirm_password')!.touched;
  }
}
