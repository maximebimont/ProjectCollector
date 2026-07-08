import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';

describe('RegisterComponent', () => {
  const authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['register']);
  let router: Router;

  beforeEach(async () => {
    authServiceSpy.register.calls.reset();

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  it('should not submit when the form is invalid', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;

    component.onSubmit();

    expect(authServiceSpy.register).not.toHaveBeenCalled();
    expect(component.registerForm.touched).toBeTrue();
  });

  it('should navigate to /items on successful registration', () => {
    authServiceSpy.register.and.returnValue(of({
      token: 't',
      id: 1,
      firstname: 'A',
      lastname: 'B',
      email: 'a@test.com',
      role: 'USER'
    }));

    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;

    component.registerForm.setValue({
      firstname: 'Alice',
      lastname: 'Acheteur',
      email: 'a@test.com',
      password: 'password123'
    });
    component.onSubmit();

    expect(authServiceSpy.register).toHaveBeenCalledWith({
      firstname: 'Alice',
      lastname: 'Acheteur',
      email: 'a@test.com',
      password: 'password123'
    });
    expect(router.navigate).toHaveBeenCalledWith(['/items']);
  });

  it('should expose an error message when registration fails', () => {
    authServiceSpy.register.and.returnValue(throwError(() => ({ error: { message: 'Email déjà utilisé' } })));

    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;

    component.registerForm.setValue({
      firstname: 'Alice',
      lastname: 'Acheteur',
      email: 'a@test.com',
      password: 'password123'
    });
    component.onSubmit();

    expect(component.errorMessage).toBe('Email déjà utilisé');
    expect(component.isLoading).toBeFalse();
  });

  it('should fall back to a default error message when the server sends none', () => {
    authServiceSpy.register.and.returnValue(throwError(() => ({})));

    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;

    component.registerForm.setValue({
      firstname: 'Alice',
      lastname: 'Acheteur',
      email: 'a@test.com',
      password: 'password123'
    });
    component.onSubmit();

    expect(component.errorMessage).toBe('Erreur lors de la création du compte');
    expect(component.isLoading).toBeFalse();
  });
});
