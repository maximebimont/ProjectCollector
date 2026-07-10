import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ItemService } from '../../../core/services/item.service';
import { Item } from '../../../core/models/item.model';
import { loadPage, nextPageIndex, previousPageIndex } from '../../../core/utils/paginated-list';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.scss'
})
export class ItemListComponent implements OnInit {
  private readonly itemService = inject(ItemService);

  items: Item[] = [];
  currentPage = 0;
  totalPages = 0;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadItems(0);
  }

  loadItems(page: number): void {
    loadPage(this, this.itemService.getAvailableItems(page), 'Impossible de récupérer les objets.');
  }

  goToPreviousPage(): void {
    const page = previousPageIndex(this);

    if (page !== null) {
      this.loadItems(page);
    }
  }

  goToNextPage(): void {
    const page = nextPageIndex(this);

    if (page !== null) {
      this.loadItems(page);
    }
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

    return sellerName || 'Vendeur non renseigné';
  }
}
