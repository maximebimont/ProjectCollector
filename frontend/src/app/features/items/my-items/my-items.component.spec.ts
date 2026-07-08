import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MyItemsComponent } from './my-items.component';
import { ItemService } from '../../../core/services/item.service';
import { Item } from '../../../core/models/item.model';

describe('MyItemsComponent', () => {
  const itemServiceSpy = jasmine.createSpyObj<ItemService>('ItemService', ['getMyItems', 'deleteItem']);
  let router: Router;

  const item: Item = {
    id: 1,
    title: 'Mon objet',
    description: 'Description',
    price: 20,
    imageUrl: null,
    status: 'AVAILABLE',
    sellerId: 1,
    sellerFirstname: 'Alice',
    sellerLastname: 'Vendeuse',
    createdAt: '2026-07-05T10:00:00Z',
    updatedAt: null
  };

  function setup(feedback: string | null = null) {
    itemServiceSpy.getMyItems.calls.reset();
    itemServiceSpy.deleteItem.calls.reset();

    const activatedRouteStub = {
      snapshot: { queryParamMap: convertToParamMap(feedback ? { feedback } : {}) }
    };

    TestBed.configureTestingModule({
      imports: [MyItemsComponent],
      providers: [
        provideRouter([]),
        { provide: ItemService, useValue: itemServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    itemServiceSpy.getMyItems.and.returnValue(of([item]));

    return TestBed.createComponent(MyItemsComponent);
  }

  it('should load the current user items', () => {
    const fixture = setup();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.items).toEqual([item]);
    expect(component.isLoading).toBeFalse();
  });

  it('should expose an error message when loading fails', () => {
    const fixture = setup();
    itemServiceSpy.getMyItems.and.returnValue(throwError(() => new Error('network error')));
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.errorMessage).toBe('Impossible de récupérer vos objets.');
  });

  it('should show a success message for created feedback and clear the query param', () => {
    const fixture = setup('created');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.successMessage).toBe('Objet créé avec succès.');
    expect(router.navigate).toHaveBeenCalled();
  });

  it('should show a success message for updated feedback', () => {
    const fixture = setup('updated');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.successMessage).toBe('Objet modifié avec succès.');
  });

  it('should not delete the item when the confirmation is cancelled', () => {
    const fixture = setup();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteItem(item);

    expect(itemServiceSpy.deleteItem).not.toHaveBeenCalled();
  });

  it('should delete the item when confirmed', () => {
    const fixture = setup();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    spyOn(window, 'confirm').and.returnValue(true);
    itemServiceSpy.deleteItem.and.returnValue(of({ message: 'ok' }));

    component.deleteItem(item);

    expect(itemServiceSpy.deleteItem).toHaveBeenCalledWith(1);
    expect(component.items).toEqual([]);
    expect(component.successMessage).toBe('Objet supprimé avec succès.');
  });

  it('should expose an action error message when deletion fails', () => {
    const fixture = setup();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    spyOn(window, 'confirm').and.returnValue(true);
    itemServiceSpy.deleteItem.and.returnValue(throwError(() => ({ error: { message: 'Erreur suppression' } })));

    component.deleteItem(item);

    expect(component.actionErrorMessage).toBe('Erreur suppression');
    expect(component.deletingItemId).toBeNull();
  });

  it('should track items by id', () => {
    const fixture = setup();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.trackByItemId(0, item)).toBe(1);
  });
});
