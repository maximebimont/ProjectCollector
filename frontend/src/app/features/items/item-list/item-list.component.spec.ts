import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
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
});
