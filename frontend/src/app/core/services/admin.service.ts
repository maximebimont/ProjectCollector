import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item, Page } from '../models/item.model';
import { User } from '../models/user.model';
import { AdminUserStatusRequest } from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly apiUrl = '/api/admin';

  constructor(private readonly http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  setUserEnabled(userId: number, enabled: boolean): Observable<User> {
    const request: AdminUserStatusRequest = { enabled };
    return this.http.patch<User>(`${this.apiUrl}/users/${userId}/status`, request);
  }

  getAllItems(page = 0, size = 20): Observable<Page<Item>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Item>>(`${this.apiUrl}/items`, { params });
  }

  deleteItem(itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/items/${itemId}`);
  }
}
