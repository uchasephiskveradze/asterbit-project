import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { LoginPage } from './login.page';

const translateTesting = provideTranslateService({
  fallbackLang: 'en',
  lang: 'en',
  loader: { provide: TranslateLoader, useValue: { getTranslation: () => of({}) } },
});

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let auth: { login: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    auth = {
      login: vi.fn(() => of(false)),
    };

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([]),
        translateTesting,
        { provide: AuthService, useValue: auth },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not call auth.login when the form is invalid', () => {
    component.onSubmit();

    expect(auth.login).not.toHaveBeenCalled();
    expect(component.form.invalid).toBe(true);
  });

  it('should show an error when credentials are rejected', () => {
    component.form.setValue({
      email: 'admin@blog.com',
      password: 'admin123',
    });

    component.onSubmit();

    expect(auth.login).toHaveBeenCalledWith('admin@blog.com', 'admin123');
    expect(component.error()).toBe('auth.invalidCredentials');
  });
});
