import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ItemEditComponent } from './item-edit.component';
import { ItemService } from '../../../core/services/item.service';
import { Item } from '../../../core/models/item.model';

describe('ItemEditComponent', () => {
  const itemServiceSpy = jasmine.createSpyObj<ItemService>('ItemService', ['getItemById', 'updateItem']);
  let router: Router;

  const item: Item = {
    id: 5,
    title: 'Objet existant',
    description: 'Description existante',
    price: 40,
    imageUrl: 'https://example.com/image.jpg',
    status: 'AVAILABLE',
    sellerId: 1,
    sellerFirstname: 'Alice',
    sellerLastname: 'Vendeuse',
    createdAt: '2026-07-05T10:00:00Z',
    updatedAt: null
  };

  function setup(id: string | null) {
    itemServiceSpy.getItemById.calls.reset();
    itemServiceSpy.updateItem.calls.reset();

    const activatedRouteStub = {
      snapshot: { paramMap: convertToParamMap(id ? { id } : {}) }
    };

    TestBed.configureTestingModule({
      imports: [ItemEditComponent],
      providers: [
        provideRouter([]),
        { provide: ItemService, useValue: itemServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    return TestBed.createComponent(ItemEditComponent);
  }

  it('should redirect to my-items when no id is provided', () => {
    const fixture = setup(null);
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/my-items']);
    expect(itemServiceSpy.getItemById).not.toHaveBeenCalled();
  });

  it('should load the item and patch the form', () => {
    itemServiceSpy.getItemById.and.returnValue(of(item));

    const fixture = setup('5');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.itemId).toBe(5);
    expect(component.itemForm.value.title).toBe('Objet existant');
    expect(component.isPageLoading).toBeFalse();
  });

  it('should expose a load error message when the item cannot be fetched', () => {
    itemServiceSpy.getItemById.and.returnValue(throwError(() => ({ error: { message: 'Introuvable' } })));

    const fixture = setup('5');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.loadErrorMessage).toBe('Introuvable');
    expect(component.isPageLoading).toBeFalse();
  });

  it('should update the item and navigate on success', () => {
    itemServiceSpy.getItemById.and.returnValue(of(item));
    itemServiceSpy.updateItem.and.returnValue(of(item));

    const fixture = setup('5');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.itemForm.patchValue({ title: 'Titre modifié' });
    component.onSubmit();

    expect(itemServiceSpy.updateItem).toHaveBeenCalledWith(5, jasmine.objectContaining({ title: 'Titre modifié' }));
    expect(router.navigate).toHaveBeenCalledWith(['/my-items'], { queryParams: { feedback: 'updated' } });
  });

  it('should expose a form error message when the update fails', () => {
    itemServiceSpy.getItemById.and.returnValue(of(item));
    itemServiceSpy.updateItem.and.returnValue(throwError(() => ({ error: { message: 'Erreur serveur' } })));

    const fixture = setup('5');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.onSubmit();

    expect(component.formErrorMessage).toBe('Erreur serveur');
    expect(component.isSaving).toBeFalse();
  });
});
