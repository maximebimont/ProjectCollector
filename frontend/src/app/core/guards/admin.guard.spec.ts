import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

describe('adminGuard', () => {
  const authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticated', 'isAdmin']);
  let routerSpy: jasmine.SpyObj<Router>;
  let urlTree: UrlTree;

  beforeEach(() => {
    urlTree = {} as UrlTree;
    routerSpy = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    routerSpy.createUrlTree.and.returnValue(urlTree);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  it('should allow navigation for an authenticated admin', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.isAdmin.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));

    expect(result).toBeTrue();
  });

  it('should redirect to the catalogue when authenticated but not admin', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.isAdmin.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));

    expect(result).toBe(urlTree);
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/items']);
  });

  it('should redirect to the catalogue when not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    authServiceSpy.isAdmin.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));

    expect(result).toBe(urlTree);
  });
});
