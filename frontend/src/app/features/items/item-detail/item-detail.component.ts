import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Item } from '../../../core/models/item.model';
import { ItemService } from '../../../core/services/item.service';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './item-detail.component.html',
  styleUrl: './item-detail.component.scss'
})
export class ItemDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private itemService = inject(ItemService);
  private orderService = inject(OrderService);

  authService = inject(AuthService);

  item: Item | null = null;
  order: Order | null = null;

  isLoading = true;
  isBuying = false;
  errorMessage = '';
  successMessage = '';
  returnToMyItems = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.returnToMyItems = this.route.snapshot.queryParamMap.get('from') === 'my-items';

    if (!id) {
      this.router.navigate(['/items']);
      return;
    }

    this.loadItem(id);
  }

  loadItem(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.itemService.getItemById(id).subscribe({
      next: (item) => {
        this.item = item;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Objet introuvable.';
        this.isLoading = false;
      }
    });
  }

  buyItem(): void {
    if (!this.item) {
      return;
    }

    if (this.isOwnItem()) {
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.isBuying = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.orderService.buyItem(this.item.id).subscribe({
      next: (order) => {
        this.order = order;
        this.successMessage = 'Achat effectué avec succès.';
        this.isBuying = false;

        if (this.item) {
          this.item.status = 'SOLD';
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Impossible d’acheter cet objet.';
        this.isBuying = false;
      }
    });
  }

  isOwnItem(): boolean {
    if (!this.item) {
      return false;
    }

    return this.authService.getCurrentUserId() === this.item.sellerId;
  }
}
