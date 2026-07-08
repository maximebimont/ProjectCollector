import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ItemDetailComponent } from './item-detail.component';
import { ItemService } from '../../../core/services/item.service';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { Item } from '../../../core/models/item.model';
import { Order } from '../../../core/models/order.model';

describe('ItemDetailComponent', () => {
  const itemServiceSpy = jasmine.createSpyObj<ItemService>('ItemService', ['getItemById']);
  const orderServiceSpy = jasmine.createSpyObj<OrderService>('OrderService', ['buyItem']);
  const authServiceSpy = jasmine.createSpyObj<AuthService>(
    'AuthService', ['isAuthenticated', 'getCurrentUserId']
  );
  let router: Router;

  // Fabrique plutot qu'une constante partagee : buyItem() mute item.status
  // en place, une reference partagee entre tests provoquerait des fuites
  // d'etat aleatoires (Jasmine execute les specs dans un ordre aleatoire).
  function makeAvailableItem(): Item {
    return {
      id: 5,
      title: 'Figurine Star Wars',
      description: 'Description',
      price: 100,
      imageUrl: null,
      status: 'AVAILABLE',
      sellerId: 1,
      sellerFirstname: 'Paul',
      sellerLastname: 'Vendeur',
      createdAt: '2026-07-05T10:00:00Z',
      updatedAt: null
    };
  }

  const order: Order = {
    id: 1,
    itemId: 5,
    itemTitle: 'Figurine Star Wars',
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

  function setup(id: string | null = '5', queryParams: Record<string, string> = {}) {
    const activatedRouteStub = {
      snapshot: {
        paramMap: convertToParamMap(id ? { id } : {}),
        queryParamMap: convertToParamMap(queryParams)
      }
    };

    TestBed.configureTestingModule({
      imports: [ItemDetailComponent],
      providers: [
        provideRouter([]),
        { provide: ItemService, useValue: itemServiceSpy },
        { provide: OrderService, useValue: orderServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    return TestBed.createComponent(ItemDetailComponent);
  }

  beforeEach(() => {
    itemServiceSpy.getItemById.calls.reset();
    orderServiceSpy.buyItem.calls.reset();
    authServiceSpy.isAuthenticated.calls.reset();
    authServiceSpy.getCurrentUserId.calls.reset();

    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.getCurrentUserId.and.returnValue(2);
  });

  it('should redirect to /items when no id is provided', () => {
    const fixture = setup(null);
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/items']);
    expect(itemServiceSpy.getItemById).not.toHaveBeenCalled();
  });

  it('should load the item on init', () => {
    itemServiceSpy.getItemById.and.returnValue(of(makeAvailableItem()));

    const fixture = setup('5');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.item).toEqual(makeAvailableItem());
    expect(component.isLoading).toBeFalse();
  });

  it('should set returnToMyItems when the from query param is my-items', () => {
    itemServiceSpy.getItemById.and.returnValue(of(makeAvailableItem()));

    const fixture = setup('5', { from: 'my-items' });
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.returnToMyItems).toBeTrue();
  });

  it('should expose an error message when the item cannot be loaded', () => {
    itemServiceSpy.getItemById.and.returnValue(throwError(() => new Error('not found')));

    const fixture = setup('5');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.errorMessage).toBe('Objet introuvable.');
    expect(component.isLoading).toBeFalse();
  });

  it('should not buy a sold item', () => {
    itemServiceSpy.getItemById.and.returnValue(of({ ...makeAvailableItem(), status: 'SOLD' }));

    const fixture = setup('5');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.buyItem();

    expect(orderServiceSpy.buyItem).not.toHaveBeenCalled();
  });

  it('should not buy your own item', () => {
    itemServiceSpy.getItemById.and.returnValue(of(makeAvailableItem()));
    authServiceSpy.getCurrentUserId.and.returnValue(1);

    const fixture = setup('5');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.buyItem();

    expect(orderServiceSpy.buyItem).not.toHaveBeenCalled();
  });

  it('should redirect to login when buying while not authenticated', () => {
    itemServiceSpy.getItemById.and.returnValue(of(makeAvailableItem()));
    authServiceSpy.isAuthenticated.and.returnValue(false);

    const fixture = setup('5');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.buyItem();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(orderServiceSpy.buyItem).not.toHaveBeenCalled();
  });

  it('should buy the item successfully', () => {
    itemServiceSpy.getItemById.and.returnValue(of(makeAvailableItem()));
    orderServiceSpy.buyItem.and.returnValue(of(order));

    const fixture = setup('5');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.buyItem();

    expect(component.order).toEqual(order);
    expect(component.successMessage).toBe('Achat réalisé avec succès.');
    expect(component.item?.status).toBe('SOLD');
    expect(component.isBuying).toBeFalse();
  });

  it('should expose an error message when the purchase fails', () => {
    itemServiceSpy.getItemById.and.returnValue(of(makeAvailableItem()));
    orderServiceSpy.buyItem.and.returnValue(throwError(() => ({ error: { message: 'Déjà vendu' } })));

    const fixture = setup('5');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.buyItem();

    expect(component.errorMessage).toBe('Déjà vendu');
    expect(component.isBuying).toBeFalse();
  });

  it('should report the item status label', () => {
    itemServiceSpy.getItemById.and.returnValue(of(makeAvailableItem()));

    const fixture = setup('5');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.getStatusLabel()).toBe('Disponible');

    component.item = { ...makeAvailableItem(), status: 'SOLD' };
    expect(component.getStatusLabel()).toBe('Vendu');
  });

  it('should build the seller name with a fallback', () => {
    itemServiceSpy.getItemById.and.returnValue(of(makeAvailableItem()));

    const fixture = setup('5');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.getSellerName()).toBe('Paul Vendeur');

    component.item = { ...makeAvailableItem(), sellerFirstname: '', sellerLastname: '' };
    expect(component.getSellerName()).toBe('Vendeur non renseigné');

    component.item = null;
    expect(component.getSellerName()).toBe('Vendeur non renseigné');
  });

  it('should build the purchase hint depending on item and auth state', () => {
    itemServiceSpy.getItemById.and.returnValue(of(makeAvailableItem()));

    const fixture = setup('5');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.getPurchaseHint()).toBe('Cet objet est disponible à l\'achat.');

    component.item = { ...makeAvailableItem(), status: 'SOLD' };
    expect(component.getPurchaseHint()).toBe('Cet objet a déjà été vendu.');

    component.item = makeAvailableItem();
    authServiceSpy.isAuthenticated.and.returnValue(false);
    expect(component.getPurchaseHint()).toBe('Connectez-vous pour acheter cet objet.');

    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.getCurrentUserId.and.returnValue(1);
    expect(component.getPurchaseHint()).toBe('Vous êtes le vendeur de cet objet.');
  });

  it('should return an empty purchase hint when there is no item', () => {
    itemServiceSpy.getItemById.and.returnValue(of(makeAvailableItem()));

    const fixture = setup('5');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.item = null;
    expect(component.getPurchaseHint()).toBe('');
  });

  it('should not be the own item when there is no item', () => {
    itemServiceSpy.getItemById.and.returnValue(of(makeAvailableItem()));

    const fixture = setup('5');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.item = null;
    expect(component.isOwnItem()).toBeFalse();
  });

  it('should fall back to the default seller label when names are missing', () => {
    itemServiceSpy.getItemById.and.returnValue(of(makeAvailableItem()));

    const fixture = setup('5');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.item = {
      ...makeAvailableItem(),
      sellerFirstname: null as unknown as string,
      sellerLastname: null as unknown as string
    };
    expect(component.getSellerName()).toBe('Vendeur non renseigné');
  });

  it('should fall back to a default error message when the purchase fails without one', () => {
    itemServiceSpy.getItemById.and.returnValue(of(makeAvailableItem()));
    orderServiceSpy.buyItem.and.returnValue(throwError(() => ({})));

    const fixture = setup('5');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.buyItem();

    expect(component.errorMessage).toBe('Une erreur est survenue. Veuillez réessayer.');
    expect(component.isBuying).toBeFalse();
  });
});
