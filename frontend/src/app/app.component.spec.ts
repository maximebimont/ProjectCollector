import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AppComponent } from './app.component';
import { AuthService } from './core/services/auth.service';

describe('AppComponent', () => {
  const authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticated', 'logout']);

  beforeEach(async () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);

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
});
