import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdminItemsComponent } from './admin-items.component';
import { AdminService } from '../../../core/services/admin.service';
import { Item, Page } from '../../../core/models/item.model';

describe('AdminItemsComponent', () => {
  const adminServiceSpy = jasmine.createSpyObj<AdminService>('AdminService', ['getAllItems', 'deleteItem']);

  const item: Item = {
    id: 10,
    title: 'Figurine douteuse',
    description: 'Annonce a moderer',
    price: 10,
    imageUrl: null,
    status: 'AVAILABLE',
    sellerId: 2,
    sellerFirstname: 'Paul',
    sellerLastname: 'Vendeur',
    createdAt: '2026-07-05T10:00:00Z',
    updatedAt: null
  };

  function setup() {
    adminServiceSpy.getAllItems.calls.reset();
    adminServiceSpy.deleteItem.calls.reset();

    const page: Page<Item> = { content: [item], number: 0, totalPages: 2, totalElements: 2 };
    adminServiceSpy.getAllItems.and.returnValue(of(page));

    TestBed.configureTestingModule({
      imports: [AdminItemsComponent],
      providers: [
        provideRouter([]),
        { provide: AdminService, useValue: adminServiceSpy }
      ]
    }).compileComponents();

    return TestBed.createComponent(AdminItemsComponent);
  }

  it('should load all items', () => {
    const fixture = setup();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.items).toEqual([item]);
    expect(component.totalPages).toBe(2);
    expect(component.isLoading).toBeFalse();
  });

  it('should expose an error message when loading fails', () => {
    const fixture = setup();
    adminServiceSpy.getAllItems.and.returnValue(throwError(() => new Error('network error')));
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.errorMessage).toBe('Impossible de récupérer les annonces.');
  });

  it('should go to the next page', () => {
    const fixture = setup();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.goToNextPage();

    expect(adminServiceSpy.getAllItems).toHaveBeenCalledWith(1);
  });

  it('should not go past the last page', () => {
    const fixture = setup();
    adminServiceSpy.getAllItems.and.returnValue(
      of({ content: [item], number: 1, totalPages: 2, totalElements: 2 })
    );
    fixture.detectChanges();
    const component = fixture.componentInstance;

    adminServiceSpy.getAllItems.calls.reset();
    component.goToNextPage();

    expect(adminServiceSpy.getAllItems).not.toHaveBeenCalled();
  });

  it('should go to the previous page', () => {
    const fixture = setup();
    adminServiceSpy.getAllItems.and.returnValue(
      of({ content: [item], number: 1, totalPages: 2, totalElements: 2 })
    );
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.goToPreviousPage();

    expect(adminServiceSpy.getAllItems).toHaveBeenCalledWith(0);
  });

  it('should not go before the first page', () => {
    const fixture = setup();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    adminServiceSpy.getAllItems.calls.reset();
    component.goToPreviousPage();

    expect(adminServiceSpy.getAllItems).not.toHaveBeenCalled();
  });

  it('should not delete the item when the confirmation is cancelled', () => {
    const fixture = setup();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteItem(item);

    expect(adminServiceSpy.deleteItem).not.toHaveBeenCalled();
  });

  it('should delete the item when confirmed', () => {
    const fixture = setup();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    spyOn(window, 'confirm').and.returnValue(true);
    adminServiceSpy.deleteItem.and.returnValue(of(undefined));

    component.deleteItem(item);

    expect(adminServiceSpy.deleteItem).toHaveBeenCalledWith(10);
    expect(component.items).toEqual([]);
    expect(component.successMessage).toBe('Annonce supprimée avec succès.');
  });

  it('should expose an action error message when deletion fails', () => {
    const fixture = setup();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    spyOn(window, 'confirm').and.returnValue(true);
    adminServiceSpy.deleteItem.and.returnValue(throwError(() => ({ error: { message: 'Erreur suppression' } })));

    component.deleteItem(item);

    expect(component.actionErrorMessage).toBe('Erreur suppression');
    expect(component.deletingItemId).toBeNull();
  });

  it('should fall back to a default action error message when the server sends none', () => {
    const fixture = setup();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    spyOn(window, 'confirm').and.returnValue(true);
    adminServiceSpy.deleteItem.and.returnValue(throwError(() => ({})));

    component.deleteItem(item);

    expect(component.actionErrorMessage).toBe('Une erreur est survenue. Veuillez réessayer.');
  });

  it('should track items by id', () => {
    const fixture = setup();
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.trackByItemId(0, item)).toBe(10);
  });
});
