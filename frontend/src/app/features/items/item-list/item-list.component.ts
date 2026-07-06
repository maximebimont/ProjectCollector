import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ItemService } from '../../../core/services/item.service';
import { Item } from '../../../core/models/item.model';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.scss'
})
export class ItemListComponent implements OnInit {
  private itemService = inject(ItemService);

  items: Item[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.itemService.getAvailableItems().subscribe({
      next: (items) => {
        this.items = items;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Impossible de récupérer les objets.';
        this.isLoading = false;
      }
    });
  }

  trackByItemId(index: number, item: Item): number {
    return item.id;
  }

  getShortDescription(description: string | null | undefined): string {
    if (!description?.trim()) {
      return 'Aucune description disponible.';
    }

    return description.length > 120
      ? `${description.slice(0, 117).trim()}...`
      : description;
  }

  getSellerName(item: Item): string {
    const firstname = item.sellerFirstname?.trim();
    const lastname = item.sellerLastname?.trim();
    const sellerName = `${firstname ?? ''} ${lastname ?? ''}`.trim();

    return sellerName || 'Vendeur non renseign�';
  }
}
