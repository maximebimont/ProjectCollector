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

  it('should not submit when the form is invalid', () => {
    itemServiceSpy.getItemById.and.returnValue(of(item));

    const fixture = setup('5');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.itemForm.patchValue({ price: null });
    component.onSubmit();

    expect(itemServiceSpy.updateItem).not.toHaveBeenCalled();
    expect(component.formErrorMessage).toBe('Une erreur est survenue. Veuillez vérifier le formulaire.');
    expect(component.itemForm.touched).toBeTrue();
  });

  it('should default the image url field to empty when the item has none', () => {
    itemServiceSpy.getItemById.and.returnValue(of({ ...item, imageUrl: null }));

    const fixture = setup('5');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.itemForm.value.imageUrl).toBe('');
  });

  it('should fall back to a default load error message when the server sends none', () => {
    itemServiceSpy.getItemById.and.returnValue(throwError(() => ({})));

    const fixture = setup('5');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.loadErrorMessage).toBe('Impossible de charger cet objet.');
  });

  it('should send a null image url when the field is left blank', () => {
    itemServiceSpy.getItemById.and.returnValue(of(item));
    itemServiceSpy.updateItem.and.returnValue(of(item));

    const fixture = setup('5');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.itemForm.patchValue({ imageUrl: '   ' });
    component.onSubmit();

    expect(itemServiceSpy.updateItem).toHaveBeenCalledWith(5, jasmine.objectContaining({ imageUrl: null }));
  });

  it('should fall back to a default form error message when the server sends none', () => {
    itemServiceSpy.getItemById.and.returnValue(of(item));
    itemServiceSpy.updateItem.and.returnValue(throwError(() => ({})));

    const fixture = setup('5');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.onSubmit();

    expect(component.formErrorMessage).toBe('Une erreur est survenue. Veuillez réessayer.');
    expect(component.isSaving).toBeFalse();
  });
});
