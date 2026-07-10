import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdminUsersComponent } from './admin-users.component';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

describe('AdminUsersComponent', () => {
  const adminServiceSpy = jasmine.createSpyObj<AdminService>('AdminService', ['getAllUsers', 'setUserEnabled']);
  const authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentUserId']);

  const admin: User = {
    id: 1,
    firstname: 'Admin',
    lastname: 'Collector',
    email: 'admin@test.com',
    role: 'ADMIN',
    enabled: true,
    createdAt: '2026-07-05T10:00:00Z'
  };

  const user: User = {
    id: 2,
    firstname: 'Paul',
    lastname: 'Vendeur',
    email: 'vendeur@test.com',
    role: 'USER',
    enabled: true,
    createdAt: '2026-07-05T10:00:00Z'
  };

  function setup() {
    adminServiceSpy.getAllUsers.calls.reset();
    adminServiceSpy.setUserEnabled.calls.reset();
    authServiceSpy.getCurrentUserId.calls.reset();

    authServiceSpy.getCurrentUserId.and.returnValue(1);
    adminServiceSpy.getAllUsers.and.returnValue(of([admin, user]));

    TestBed.configureTestingModule({
      imports: [AdminUsersComponent],
      providers: [
        provideRouter([]),
        { provide: AdminService, useValue: adminServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    return TestBed.createComponent(AdminUsersComponent);
  }

  it('should load all users', () => {
    const fixture = setup();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.users).toEqual([admin, user]);
    expect(component.isLoading).toBeFalse();
  });

  it('should expose an error message when loading fails', () => {
    const fixture = setup();
    adminServiceSpy.getAllUsers.and.returnValue(throwError(() => new Error('network error')));
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.errorMessage).toBe('Impossible de récupérer la liste des utilisateurs.');
  });

  it('should identify the current user', () => {
    const fixture = setup();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.isCurrentUser(admin)).toBeTrue();
    expect(component.isCurrentUser(user)).toBeFalse();
  });

  it('should not change status when the confirmation is cancelled', () => {
    const fixture = setup();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    spyOn(window, 'confirm').and.returnValue(false);

    component.toggleStatus(user);

    expect(adminServiceSpy.setUserEnabled).not.toHaveBeenCalled();
  });

  it('should disable a user when confirmed', () => {
    const fixture = setup();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    spyOn(window, 'confirm').and.returnValue(true);
    adminServiceSpy.setUserEnabled.and.returnValue(of({ ...user, enabled: false }));

    component.toggleStatus(user);

    expect(adminServiceSpy.setUserEnabled).toHaveBeenCalledWith(2, false);
    expect(user.enabled).toBeFalse();
    expect(component.successMessage).toBe('Compte désactivé avec succès.');
    expect(component.updatingUserId).toBeNull();
  });

  it('should reenable a disabled user', () => {
    const fixture = setup();
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const disabledUser: User = { ...user, enabled: false };

    spyOn(window, 'confirm').and.returnValue(true);
    adminServiceSpy.setUserEnabled.and.returnValue(of({ ...disabledUser, enabled: true }));

    component.toggleStatus(disabledUser);

    expect(adminServiceSpy.setUserEnabled).toHaveBeenCalledWith(2, true);
    expect(disabledUser.enabled).toBeTrue();
    expect(component.successMessage).toBe('Compte réactivé avec succès.');
  });

  it('should expose an action error message when the update fails', () => {
    const fixture = setup();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    spyOn(window, 'confirm').and.returnValue(true);
    adminServiceSpy.setUserEnabled.and.returnValue(
      throwError(() => ({ error: { message: 'Impossible de modifier son propre compte' } }))
    );

    component.toggleStatus(user);

    expect(component.actionErrorMessage).toBe('Impossible de modifier son propre compte');
    expect(component.updatingUserId).toBeNull();
  });

  it('should fall back to a default action error message when the server sends none', () => {
    const fixture = setup();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    spyOn(window, 'confirm').and.returnValue(true);
    adminServiceSpy.setUserEnabled.and.returnValue(throwError(() => ({})));

    component.toggleStatus(user);

    expect(component.actionErrorMessage).toBe('Une erreur est survenue. Veuillez réessayer.');
  });

  it('should track users by id', () => {
    const fixture = setup();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.trackByUserId(0, user)).toBe(2);
  });
});
