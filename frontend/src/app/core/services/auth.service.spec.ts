import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
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
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    localStorage.clear();
    httpMock.verify();
  });

  it('should register and persist the returned session', () => {
    const response = {
      token: 'new-token',
      id: 3,
      firstname: 'Bob',
      lastname: 'Nouveau',
      email: 'bob@test.com',
      role: 'USER' as const
    };

    service.register({ firstname: 'Bob', lastname: 'Nouveau', email: 'bob@test.com', password: 'password123' })
      .subscribe(res => expect(res).toEqual(response));

    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush(response);

    expect(service.getToken()).toBe('new-token');
    expect(service.getCurrentUserId()).toBe(3);
  });

  it('should login and persist the returned session', () => {
    const response = {
      token: 'login-token',
      id: 4,
      firstname: 'Alice',
      lastname: 'Acheteur',
      email: 'alice@test.com',
      role: 'USER' as const
    };

    service.login({ email: 'alice@test.com', password: 'password123' })
      .subscribe(res => expect(res).toEqual(response));

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(response);

    expect(service.getToken()).toBe('login-token');
    expect(service.getCurrentUserId()).toBe(4);
  });

  it('should fetch the current user', () => {
    const user = {
      id: 1,
      firstname: 'Paul',
      lastname: 'Dupont',
      email: 'paul@test.com',
      role: 'USER' as const,
      createdAt: '2026-07-05T10:00:00Z'
    };

    service.getCurrentUser().subscribe(res => expect(res).toEqual(user));

    const req = httpMock.expectOne('/api/users/me');
    expect(req.request.method).toBe('GET');
    req.flush(user);
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
