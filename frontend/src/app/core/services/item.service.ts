import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item, ItemRequest, Page } from '../models/item.model';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private readonly apiUrl = '/api/items';

  constructor(private readonly http: HttpClient) {}

  getAvailableItems(page = 0, size = 20): Observable<Page<Item>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Item>>(this.apiUrl, { params });
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