import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should persist the session in local storage', () => {
    service.saveSession({
      token: 'demo-token',
      id: 7,
      firstname: 'Alice',
      lastname: 'Acheteur',
      email: 'alice@test.com',
      role: 'USER'
    });

    expect(service.getToken()).toBe('demo-token');
    expect(service.getCurrentUserId()).toBe(7);
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should clear the session and redirect to login on logout', () => {
    service.saveToken('demo-token');
    service.saveCurrentUserId(7);

    service.logout();

    expect(service.getToken()).toBeNull();
    expect(service.getCurrentUserId()).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
