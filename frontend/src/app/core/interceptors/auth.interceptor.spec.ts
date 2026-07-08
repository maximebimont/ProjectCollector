import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should add the Authorization header when a token is present', () => {
    localStorage.setItem('collector_token', 'demo-token');

    httpClient.get('/api/items').subscribe();

    const req = httpMock.expectOne('/api/items');
    expect(req.request.headers.get('Authorization')).toBe('Bearer demo-token');
    req.flush({});
  });

  it('should not add the Authorization header when there is no token', () => {
    httpClient.get('/api/items').subscribe();

    const req = httpMock.expectOne('/api/items');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});
