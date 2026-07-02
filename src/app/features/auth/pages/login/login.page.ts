import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { finalize, tap } from 'rxjs';

import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);

  public readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  public onSubmit(): void {
    this.form.markAllAsTouched();
    this.error.set(null);

    if (this.form.invalid) {
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.loading.set(true);

    this.auth
      .login(email, password)
      .pipe(
        tap((success) => {
          if (!success) {
            this.error.set('auth.invalidCredentials');
            return;
          }

          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/posts';
          void this.router.navigateByUrl(returnUrl);
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
