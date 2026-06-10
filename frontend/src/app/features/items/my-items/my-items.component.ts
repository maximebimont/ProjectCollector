import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { Item } from '../../../core/models/item.model';
import { ItemService } from '../../../core/services/item.service';

@Component({
  selector: 'app-my-items',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-items.component.html',
  styleUrl: './my-items.component.scss'
})
export class MyItemsComponent implements OnInit {
  private itemService = inject(ItemService);
  authService = inject(AuthService);

  items: Item[] = [];
  isLoading = true;
  errorMessage = '';
  actionErrorMessage = '';
  deletingItemId: number | null = null;

  ngOnInit(): void {
    this.loadMyItems();
  }

  loadMyItems(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.actionErrorMessage = '';

    this.itemService.getMyItems().subscribe({
      next: (items) => {
        this.items = items;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Impossible de récupérer vos objets.';
        this.isLoading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  trackByItemId(index: number, item: Item): number {
    return item.id;
  }

  deleteItem(item: Item): void {
    const confirmed = window.confirm(`Supprimer l’objet "${item.title}" ?`);

    if (!confirmed) {
      return;
    }

    this.deletingItemId = item.id;
    this.actionErrorMessage = '';

    this.itemService.deleteItem(item.id).subscribe({
      next: () => {
        this.items = this.items.filter(currentItem => currentItem.id !== item.id);
        this.deletingItemId = null;
      },
      error: (error) => {
        console.error(error);
        this.actionErrorMessage = error.error?.message || 'Impossible de supprimer cet objet.';
        this.deletingItemId = null;
      }
    });
  }
}
