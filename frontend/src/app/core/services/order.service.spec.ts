import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Order } from '../models/order.model';
import { OrderService } from './order.service';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  const order: Order = {
    id: 1,
    itemId: 10,
    itemTitle: 'Figurine',
    itemImageUrl: null,
    buyerId: 2,
    buyerFirstname: 'Alice',
    buyerLastname: 'Acheteur',
    sellerId: 3,
    sellerFirstname: 'Paul',
    sellerLastname: 'Vendeur',
    itemPrice: 100,
    platformFee: 5,
    sellerAmount: 95,
    totalAmount: 100,
    status: 'COMPLETED',
    createdAt: '2026-07-05T10:00:00Z'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrderService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should buy an item', () => {
    service.buyItem(10).subscribe((result) => {
      expect(result).toEqual(order);
    });

    const req = httpMock.expectOne('/api/orders/items/10');
    expect(req.request.method).toBe('POST');
    req.flush(order);
  });

  it('should fetch my purchases', () => {
    service.getMyPurchases().subscribe((orders) => {
      expect(orders).toEqual([order]);
    });

    const req = httpMock.expectOne('/api/orders/me');
    expect(req.request.method).toBe('GET');
    req.flush([order]);
  });

  it('should fetch my sales', () => {
    service.getMySales().subscribe((orders) => {
      expect(orders).toEqual([order]);
    });

    const req = httpMock.expectOne('/api/orders/sales');
    expect(req.request.method).toBe('GET');
    req.flush([order]);
  });
});
