import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AppComponent } from './app.component';
import { AuthService } from './core/services/auth.service';

describe('AppComponent', () => {
  const authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticated', 'logout']);

  beforeEach(async () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    authServiceSpy.logout.calls.reset();

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        MessageService,
        ConfirmationService,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();
  });

  it('should create the application shell', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
  });

  it('should render the Collector.shop brand and catalogue navigation', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const content = fixture.nativeElement.textContent;

    expect(content).toContain('Collector.shop');
    expect(content).toContain('Catalogue');
  });

  it('should close the mobile menu and delegate to AuthService on logout', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    component.mobileMenuOpen.set(true);

    component.logout();

    expect(component.mobileMenuOpen()).toBeFalse();
    expect(authServiceSpy.logout).toHaveBeenCalled();
  });

  it('should close the mobile menu', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    component.mobileMenuOpen.set(true);

    component.closeMenu();

    expect(component.mobileMenuOpen()).toBeFalse();
  });

  it('should toggle the mobile menu open and closed', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;

    component.toggleMenu();
    expect(component.mobileMenuOpen()).toBeTrue();

    component.toggleMenu();
    expect(component.mobileMenuOpen()).toBeFalse();
  });

  it('should detect user-space routes, including nested paths', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);

    spyOnProperty(router, 'url', 'get').and.returnValue('/my-items/42?tab=active');
    expect(component.isUserSpaceRoute()).toBeTrue();
  });

  it('should not treat catalogue routes as user-space routes', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);

    spyOnProperty(router, 'url', 'get').and.returnValue('/catalogue');

    expect(component.isUserSpaceRoute()).toBeFalse();
  });
});
