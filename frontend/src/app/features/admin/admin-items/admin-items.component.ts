import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AdminService } from '../../../core/services/admin.service';
import { Item } from '../../../core/models/item.model';
import { loadPage, nextPageIndex, previousPageIndex } from '../../../core/utils/paginated-list';

@Component({
  selector: 'app-admin-items',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-items.component.html',
  styleUrl: '../admin.component.scss'
})
export class AdminItemsComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  items: Item[] = [];
  currentPage = 0;
  totalPages = 0;
  isLoading = true;
  errorMessage = '';
  actionErrorMessage = '';
  successMessage = '';
  deletingItemId: number | null = null;

  ngOnInit(): void {
    this.loadItems(0);
  }

  loadItems(page: number): void {
    loadPage(this, this.adminService.getAllItems(page), 'Impossible de récupérer les annonces.');
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

  deleteItem(item: Item): void {
    const confirmed = window.confirm(`Supprimer l'annonce "${item.title}" ?`);

    if (!confirmed) {
      return;
    }

    this.deletingItemId = item.id;
    this.actionErrorMessage = '';
    this.successMessage = '';

    this.adminService.deleteItem(item.id).subscribe({
      next: () => {
        this.items = this.items.filter(currentItem => currentItem.id !== item.id);
        this.successMessage = 'Annonce supprimée avec succès.';
        this.deletingItemId = null;
      },
      error: (error) => {
        console.error(error);
        this.actionErrorMessage = error.error?.message || 'Une erreur est survenue. Veuillez réessayer.';
        this.deletingItemId = null;
      }
    });
  }

  trackByItemId(index: number, item: Item): number {
    return item.id;
  }
}
