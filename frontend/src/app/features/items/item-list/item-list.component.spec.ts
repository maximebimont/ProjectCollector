import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ItemService } from '../../../core/services/item.service';
import { Item } from '../../../core/models/item.model';
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

  beforeEach(async () => {
    itemServiceSpy.getAvailableItems.and.returnValue(of(items));

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
});
