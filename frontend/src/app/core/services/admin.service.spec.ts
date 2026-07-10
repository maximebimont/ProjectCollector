import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Item, Page } from '../models/item.model';
import { User } from '../models/user.model';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  const user: User = {
    id: 2,
    firstname: 'Paul',
    lastname: 'Vendeur',
    email: 'vendeur@test.com',
    role: 'USER',
    enabled: true,
    createdAt: '2026-07-05T10:00:00Z'
  };

  const item: Item = {
    id: 1,
    title: 'Console Nintendo 64',
    description: 'Console vintage en bon etat',
    price: 149.9,
    imageUrl: null,
    status: 'AVAILABLE',
    sellerId: 2,
    sellerFirstname: 'Paul',
    sellerLastname: 'Vendeur',
    createdAt: '2026-07-05T10:00:00Z',
    updatedAt: null
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch all users', () => {
    service.getAllUsers().subscribe((result) => {
      expect(result).toEqual([user]);
    });

    const req = httpMock.expectOne('/api/admin/users');
    expect(req.request.method).toBe('GET');
    req.flush([user]);
  });

  it('should update a user status', () => {
    const updatedUser = { ...user, enabled: false };

    service.setUserEnabled(2, false).subscribe((result) => {
      expect(result).toEqual(updatedUser);
    });

    const req = httpMock.expectOne('/api/admin/users/2/status');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ enabled: false });
    req.flush(updatedUser);
  });

  it('should fetch all items with the default page and size', () => {
    const page: Page<Item> = { content: [item], number: 0, totalPages: 1, totalElements: 1 };

    service.getAllItems().subscribe((result) => {
      expect(result).toEqual(page);
    });

    const req = httpMock.expectOne((request) => request.url === '/api/admin/items');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('20');
    req.flush(page);
  });

  it('should fetch all items with a custom page', () => {
    const page: Page<Item> = { content: [item], number: 2, totalPages: 5, totalElements: 41 };

    service.getAllItems(2, 10).subscribe((result) => {
      expect(result).toEqual(page);
    });

    const req = httpMock.expectOne((request) => request.url === '/api/admin/items');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('size')).toBe('10');
    req.flush(page);
  });

  it('should delete an item', () => {
    service.deleteItem(1).subscribe();

    const req = httpMock.expectOne('/api/admin/items/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
