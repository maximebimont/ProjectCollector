import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item, ItemRequest } from '../models/item.model';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private readonly apiUrl = '/api/items';

  constructor(private readonly http: HttpClient) {}

  getAvailableItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.apiUrl);
  }

  getItemById(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/${id}`);
  }

  getMyItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}/me`);
  }

  createItem(request: ItemRequest): Observable<Item> {
    return this.http.post<Item>(this.apiUrl, request);
  }

  updateItem(id: number, request: ItemRequest): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/${id}`, request);
  }

  deleteItem(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}