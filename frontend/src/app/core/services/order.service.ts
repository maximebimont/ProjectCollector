import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = '/api/orders';

  constructor(private http: HttpClient) {}

  buyItem(itemId: number): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/items/${itemId}`, {});
  }

  getMyPurchases(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/me`);
  }

  getMySales(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/sales`);
  }
}