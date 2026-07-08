import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MySalesComponent } from './my-sales.component';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';

describe('MySalesComponent', () => {
  const orderServiceSpy = jasmine.createSpyObj<OrderService>('OrderService', ['getMySales']);

  const order: Order = {
    id: 1,
    itemId: 5,
    itemTitle: 'Figurine',
    itemImageUrl: null,
    buyerId: 2,
    buyerFirstname: 'Alice',
    buyerLastname: 'Acheteur',
    sellerId: 1,
    sellerFirstname: 'Paul',
    sellerLastname: 'Vendeur',
    itemPrice: 100,
    platformFee: 5,
    sellerAmount: 95,
    totalAmount: 100,
    status: 'COMPLETED',
    createdAt: '2026-07-05T10:00:00Z'
  };

  beforeEach(async () => {
    orderServiceSpy.getMySales.calls.reset();

    await TestBed.configureTestingModule({
      imports: [MySalesComponent],
      providers: [
        provideRouter([]),
        { provide: OrderService, useValue: orderServiceSpy }
      ]
    }).compileComponents();
  });

  it('should load sales on init', () => {
    orderServiceSpy.getMySales.and.returnValue(of([order]));

    const fixture = TestBed.createComponent(MySalesComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.orders).toEqual([order]);
    expect(component.isLoading).toBeFalse();
  });

  it('should expose an error message when loading fails', () => {
    orderServiceSpy.getMySales.and.returnValue(throwError(() => new Error('network error')));

    const fixture = TestBed.createComponent(MySalesComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.errorMessage).toBe('Impossible de récupérer vos ventes.');
    expect(component.isLoading).toBeFalse();
  });

  it('should track orders by id', () => {
    orderServiceSpy.getMySales.and.returnValue(of([order]));

    const fixture = TestBed.createComponent(MySalesComponent);
    const component = fixture.componentInstance;

    expect(component.trackByOrderId(0, order)).toBe(1);
  });
});
