import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Order } from '../../../core/models/order.model';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-my-sales',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-sales.component.html',
  styleUrl: './my-sales.component.scss'
})
export class MySalesComponent implements OnInit {
  private orderService = inject(OrderService);
  authService = inject(AuthService);

  orders: Order[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getMySales().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Impossible de récupérer vos ventes.';
        this.isLoading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  trackByOrderId(index: number, order: Order): number {
    return order.id;
  }
}
