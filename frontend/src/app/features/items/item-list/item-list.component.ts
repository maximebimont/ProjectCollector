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
    this.isLoading = true;
    this.errorMessage = '';

    this.itemService.getAvailableItems(page).subscribe({
      next: (result) => {
        this.items = result.content;
        this.currentPage = result.number;
        this.totalPages = result.totalPages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Impossible de récupérer les objets.';
        this.isLoading = false;
      }
    });
  }

  goToPreviousPage(): void {
    if (this.currentPage > 0) {
      this.loadItems(this.currentPage - 1);
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.loadItems(this.currentPage + 1);
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
