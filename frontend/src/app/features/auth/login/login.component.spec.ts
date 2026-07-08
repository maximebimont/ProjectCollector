import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';

describe('LoginComponent', () => {
  const authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['login']);
  let router: Router;

  beforeEach(async () => {
    authServiceSpy.login.calls.reset();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  it('should not submit when the form is invalid', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.onSubmit();

    expect(authServiceSpy.login).not.toHaveBeenCalled();
    expect(component.loginForm.touched).toBeTrue();
  });

  it('should navigate to /items on successful login', () => {
    authServiceSpy.login.and.returnValue(of({
      token: 't',
      id: 1,
      firstname: 'A',
      lastname: 'B',
      email: 'a@test.com',
      role: 'USER'
    }));

    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.loginForm.setValue({ email: 'a@test.com', password: 'password123' });
    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({ email: 'a@test.com', password: 'password123' });
    expect(router.navigate).toHaveBeenCalledWith(['/items']);
  });

  it('should expose an error message when login fails', () => {
    authServiceSpy.login.and.returnValue(throwError(() => ({ error: { message: 'Identifiants invalides' } })));

    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.loginForm.setValue({ email: 'a@test.com', password: 'wrong' });
    component.onSubmit();

    expect(component.errorMessage).toBe('Identifiants invalides');
    expect(component.isLoading).toBeFalse();
  });

  it('should fall back to a default error message when the server sends none', () => {
    authServiceSpy.login.and.returnValue(throwError(() => ({})));

    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.loginForm.setValue({ email: 'a@test.com', password: 'wrong' });
    component.onSubmit();

    expect(component.errorMessage).toBe('Erreur lors de la connexion');
    expect(component.isLoading).toBeFalse();
  });
});
