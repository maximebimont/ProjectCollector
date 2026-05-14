import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'items',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component')
      .then(m => m.RegisterComponent)
  },
  {
    path: 'items',
    loadComponent: () => import('./features/items/item-list/item-list.component')
      .then(m => m.ItemListComponent)
  },
  {
    path: 'items/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/items/item-create/item-create.component')
      .then(m => m.ItemCreateComponent)
  },
  {
    path: 'my-items',
    canActivate: [authGuard],
    loadComponent: () => import('./features/items/my-items/my-items.component')
      .then(m => m.MyItemsComponent)
  },
  {
    path: 'my-purchases',
    canActivate: [authGuard],
    loadComponent: () => import('./features/orders/my-purchases/my-purchases.component')
      .then(m => m.MyPurchasesComponent)
  },
  {
    path: 'my-sales',
    canActivate: [authGuard],
    loadComponent: () => import('./features/orders/my-sales/my-sales.component')
      .then(m => m.MySalesComponent)
  },
  {
    path: '**',
    redirectTo: 'items'
  }
];