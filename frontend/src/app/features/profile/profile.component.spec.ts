import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

describe('ProfileComponent', () => {
  const authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentUser']);

  const user: User = {
    id: 1,
    firstname: 'Alice',
    lastname: 'Acheteur',
    email: 'alice@test.com',
    role: 'USER',
    enabled: true,
    createdAt: '2026-07-05T10:00:00Z'
  };

  beforeEach(async () => {
    authServiceSpy.getCurrentUser.calls.reset();

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();
  });

  it('should load the current user on init', () => {
    authServiceSpy.getCurrentUser.and.returnValue(of(user));

    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    expect(component.user).toEqual(user);
    expect(component.isLoading).toBeFalse();
  });

  it('should expose an error message when loading fails', () => {
    authServiceSpy.getCurrentUser.and.returnValue(throwError(() => new Error('network error')));

    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    expect(component.errorMessage).toBe('Impossible de charger votre espace utilisateur.');
    expect(component.isLoading).toBeFalse();
  });

  it('should return the fallback value for empty display values', () => {
    authServiceSpy.getCurrentUser.and.returnValue(of(user));

    const fixture = TestBed.createComponent(ProfileComponent);
    const component = fixture.componentInstance;

    expect(component.getDisplayValue('  ')).toBe('Non renseigné');
    expect(component.getDisplayValue(null)).toBe('Non renseigné');
    expect(component.getDisplayValue(undefined)).toBe('Non renseigné');
    expect(component.getDisplayValue('Alice')).toBe('Alice');
  });
});
