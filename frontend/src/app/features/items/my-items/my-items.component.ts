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

  ngOnInit(): void {
    this.loadMyItems();
  }

  loadMyItems(): void {
    this.isLoading = true;
    this.errorMessage = '';

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
}
