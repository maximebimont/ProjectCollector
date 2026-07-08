import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Item, ItemRequest } from '../models/item.model';
import { ItemService } from './item.service';

describe('ItemService', () => {
  let service: ItemService;
  let httpMock: HttpTestingController;

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
      providers: [ItemService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(ItemService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch available items', () => {
    service.getAvailableItems().subscribe((items) => {
      expect(items).toEqual([item]);
    });

    const req = httpMock.expectOne('/api/items');
    expect(req.request.method).toBe('GET');
    req.flush([item]);
  });

  it('should fetch an item by id', () => {
    service.getItemById(1).subscribe((result) => {
      expect(result).toEqual(item);
    });

    const req = httpMock.expectOne('/api/items/1');
    expect(req.request.method).toBe('GET');
    req.flush(item);
  });

  it('should fetch my items', () => {
    service.getMyItems().subscribe((items) => {
      expect(items).toEqual([item]);
    });

    const req = httpMock.expectOne('/api/items/me');
    expect(req.request.method).toBe('GET');
    req.flush([item]);
  });

  it('should create an item', () => {
    const request: ItemRequest = {
      title: 'Nouvel objet',
      description: 'Description',
      price: 20,
      imageUrl: null
    };

    service.createItem(request).subscribe((result) => {
      expect(result).toEqual(item);
    });

    const req = httpMock.expectOne('/api/items');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(item);
  });

  it('should update an item', () => {
    const request: ItemRequest = {
      title: 'Titre modifié',
      description: 'Description',
      price: 30,
      imageUrl: null
    };

    service.updateItem(1, request).subscribe((result) => {
      expect(result).toEqual(item);
    });

    const req = httpMock.expectOne('/api/items/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(item);
  });

  it('should delete an item', () => {
    service.deleteItem(1).subscribe((result) => {
      expect(result).toEqual({ message: 'ok' });
    });

    const req = httpMock.expectOne('/api/items/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'ok' });
  });
});
