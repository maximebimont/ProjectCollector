import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ItemCreateComponent } from './item-create.component';
import { ItemService } from '../../../core/services/item.service';
import { Item } from '../../../core/models/item.model';

describe('ItemCreateComponent', () => {
  const itemServiceSpy = jasmine.createSpyObj<ItemService>('ItemService', ['createItem']);
  let router: Router;

  const item: Item = {
    id: 1,
    title: 'Nouvel objet',
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

  beforeEach(async () => {
    itemServiceSpy.createItem.calls.reset();

    await TestBed.configureTestingModule({
      imports: [ItemCreateComponent],
      providers: [
        provideRouter([]),
        { provide: ItemService, useValue: itemServiceSpy }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  it('should not submit when the form is invalid', () => {
    const fixture = TestBed.createComponent(ItemCreateComponent);
    const component = fixture.componentInstance;

    component.onSubmit();

    expect(itemServiceSpy.createItem).not.toHaveBeenCalled();
    expect(component.errorMessage).not.toBe('');
  });

  it('should create the item and navigate to my-items on success', () => {
    itemServiceSpy.createItem.and.returnValue(of(item));

    const fixture = TestBed.createComponent(ItemCreateComponent);
    const component = fixture.componentInstance;

    component.itemForm.setValue({
      title: 'Nouvel objet',
      description: 'Description',
      price: 20,
      imageUrl: ''
    });
    component.onSubmit();

    expect(itemServiceSpy.createItem).toHaveBeenCalledWith({
      title: 'Nouvel objet',
      description: 'Description',
      price: 20,
      imageUrl: null
    });
    expect(router.navigate).toHaveBeenCalledWith(['/my-items'], { queryParams: { feedback: 'created' } });
  });

  it('should expose an error message when creation fails', () => {
    itemServiceSpy.createItem.and.returnValue(throwError(() => ({ error: { message: 'Erreur serveur' } })));

    const fixture = TestBed.createComponent(ItemCreateComponent);
    const component = fixture.componentInstance;

    component.itemForm.setValue({
      title: 'Nouvel objet',
      description: 'Description',
      price: 20,
      imageUrl: ''
    });
    component.onSubmit();

    expect(component.errorMessage).toBe('Erreur serveur');
    expect(component.isLoading).toBeFalse();
  });
});
