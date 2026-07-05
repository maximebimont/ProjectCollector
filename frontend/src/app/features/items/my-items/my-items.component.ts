import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  items: Item[] = [];
  isLoading = true;
  errorMessage = '';
  actionErrorMessage = '';
  successMessage = '';
  deletingItemId: number | null = null;

  ngOnInit(): void {
    this.readSuccessMessage();
    this.loadMyItems();
  }

  readSuccessMessage(): void {
    const feedback = this.route.snapshot.queryParamMap.get('feedback');

    switch (feedback) {
      case 'created':
        this.successMessage = 'Objet créé avec succès.';
        break;
      case 'updated':
        this.successMessage = 'Objet modifié avec succès.';
        break;
      default:
        this.successMessage = '';
    }

    if (feedback) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true
      });
    }
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

  trackByItemId(index: number, item: Item): number {
    return item.id;
  }

  deleteItem(item: Item): void {
    const confirmed = window.confirm(`Supprimer l'objet "${item.title}" ?`);

    if (!confirmed) {
      return;
    }

    this.deletingItemId = item.id;
    this.actionErrorMessage = '';

    this.itemService.deleteItem(item.id).subscribe({
      next: () => {
        this.items = this.items.filter(currentItem => currentItem.id !== item.id);
        this.successMessage = 'Objet supprimé avec succès.';
        this.deletingItemId = null;
      },
      error: (error) => {
        console.error(error);
        this.actionErrorMessage = error.error?.message || 'Une erreur est survenue. Veuillez réessayer.';
        this.deletingItemId = null;
      }
    });
  }
}
