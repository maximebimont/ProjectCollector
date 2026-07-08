import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Order } from '../../../core/models/order.model';
import { OrderService } from '../../../core/services/order.service';
import { OrderCardComponent } from '../order-card/order-card.component';

@Component({
  selector: 'app-my-purchases',
  standalone: true,
  imports: [CommonModule, RouterLink, OrderCardComponent],
  templateUrl: './my-purchases.component.html',
  styleUrl: './my-purchases.component.scss'
})
export class MyPurchasesComponent implements OnInit {
  private readonly orderService = inject(OrderService);

  orders: Order[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadPurchases();
  }

  loadPurchases(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getMyPurchases().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Impossible de récupérer vos achats.';
        this.isLoading = false;
      }
    });
  }

  trackByOrderId(index: number, order: Order): number {
    return order.id;
  }
}
