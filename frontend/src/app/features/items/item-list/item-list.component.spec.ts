import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ItemService } from '../../../core/services/item.service';
import { Item, Page } from '../../../core/models/item.model';
import { ItemListComponent } from './item-list.component';

describe('ItemListComponent', () => {
  const itemServiceSpy = jasmine.createSpyObj<ItemService>('ItemService', ['getAvailableItems']);
  const items: Item[] = [
    {
      id: 1,
      title: 'Console Nintendo 64',
      description: 'Console vintage en bon etat avec deux manettes.',
      price: 149.9,
      imageUrl: null,
      status: 'AVAILABLE',
      sellerId: 2,
      sellerFirstname: 'Paul',
      sellerLastname: 'Vendeur',
      createdAt: '2026-07-05T10:00:00Z',
      updatedAt: null
    }
  ];

  function makePage(content: Item[], number = 0, totalPages = 1): Page<Item> {
    return { content, number, totalPages, totalElements: content.length };
  }

  beforeEach(async () => {
    itemServiceSpy.getAvailableItems.calls.reset();
    itemServiceSpy.getAvailableItems.and.returnValue(of(makePage(items)));

    await TestBed.configureTestingModule({
      imports: [ItemListComponent],
      providers: [
        provideRouter([]),
        { provide: ItemService, useValue: itemServiceSpy }
      ]
    }).compileComponents();
  });

  it('should render the catalogue heading and loaded items', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.detectChanges();

    const content = fixture.nativeElement.textContent;

    expect(content).toContain('Objets disponibles');
    expect(content).toContain('Console Nintendo 64');
    expect(content).toContain('Paul Vendeur');
  });

  it('should expose a seller fallback when seller names are missing', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    const component = fixture.componentInstance;

    expect(component.getSellerName({ ...items[0], sellerFirstname: '', sellerLastname: '' })).toBe('Vendeur non renseigné');
  });

  it('should expose a seller fallback when seller names are null or undefined', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    const component = fixture.componentInstance;

    expect(component.getSellerName({
      ...items[0],
      sellerFirstname: null as unknown as string,
      sellerLastname: undefined as unknown as string
    })).toBe('Vendeur non renseigné');
  });

  it('should expose an error message when items cannot be loaded', () => {
    itemServiceSpy.getAvailableItems.and.returnValue(throwError(() => new Error('network error')));

    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.errorMessage).toBe('Impossible de récupérer les objets.');
    expect(component.isLoading).toBeFalse();
  });

  it('should show a default message when the description is missing', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    const component = fixture.componentInstance;

    expect(component.getShortDescription(null)).toBe('Aucune description disponible.');
    expect(component.getShortDescription('   ')).toBe('Aucune description disponible.');
  });

  it('should truncate long descriptions', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    const component = fixture.componentInstance;
    const longDescription = 'a'.repeat(150);

    const result = component.getShortDescription(longDescription);

    expect(result.endsWith('...')).toBeTrue();
    expect(result.length).toBe(120);
  });

  it('should not show the pager when there is only one page', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.pager')).toBeNull();
  });

  it('should navigate to the next and previous page', () => {
    itemServiceSpy.getAvailableItems.and.returnValue(of(makePage(items, 0, 3)));

    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.totalPages).toBe(3);
    expect(fixture.nativeElement.querySelector('.pager')).not.toBeNull();

    itemServiceSpy.getAvailableItems.and.returnValue(of(makePage(items, 1, 3)));
    component.goToNextPage();

    expect(itemServiceSpy.getAvailableItems).toHaveBeenCalledWith(1);
    expect(component.currentPage).toBe(1);

    itemServiceSpy.getAvailableItems.and.returnValue(of(makePage(items, 0, 3)));
    component.goToPreviousPage();

    expect(itemServiceSpy.getAvailableItems).toHaveBeenCalledWith(0);
    expect(component.currentPage).toBe(0);
  });

  it('should not go before the first page or past the last page', () => {
    itemServiceSpy.getAvailableItems.and.returnValue(of(makePage(items, 0, 2)));

    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    itemServiceSpy.getAvailableItems.calls.reset();
    component.goToPreviousPage();
    expect(itemServiceSpy.getAvailableItems).not.toHaveBeenCalled();

    itemServiceSpy.getAvailableItems.and.returnValue(of(makePage(items, 1, 2)));
    component.goToNextPage();
    itemServiceSpy.getAvailableItems.calls.reset();

    component.goToNextPage();
    expect(itemServiceSpy.getAvailableItems).not.toHaveBeenCalled();
  });
});
