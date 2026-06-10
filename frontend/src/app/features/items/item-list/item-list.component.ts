import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ItemService } from '../../../core/services/item.service';
import { AuthService } from '../../../core/services/auth.service';
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
  private changeDetectorRef = inject(ChangeDetectorRef);

  authService = inject(AuthService);

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

        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Impossible de récupérer les objets.';
        this.isLoading = false;

        this.changeDetectorRef.detectChanges();
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}