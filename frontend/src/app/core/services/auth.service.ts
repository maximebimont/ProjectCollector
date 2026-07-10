import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly apiUrl = '/api';
  private readonly tokenKey = 'collector_token';
  private readonly userIdKey = 'collector_user_id';
  private readonly roleKey = 'collector_role';

  constructor(private readonly http: HttpClient) {}

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, request)
      .pipe(
        tap(response => this.saveSession(response))
      );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, request)
      .pipe(
        tap(response => this.saveSession(response))
      );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/me`);
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  saveSession(response: AuthResponse): void {
    this.saveToken(response.token);
    this.saveCurrentUserId(response.id);
    this.saveRole(response.role);
  }

  saveCurrentUserId(userId: number): void {
    localStorage.setItem(this.userIdKey, String(userId));
  }

  saveRole(role: 'USER' | 'ADMIN'): void {
    localStorage.setItem(this.roleKey, role);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUserId(): number | null {
    const userId = localStorage.getItem(this.userIdKey);
    return userId ? Number(userId) : null;
  }

  getRole(): 'USER' | 'ADMIN' | null {
    return localStorage.getItem(this.roleKey) as 'USER' | 'ADMIN' | null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userIdKey);
    localStorage.removeItem(this.roleKey);
    this.router.navigate(['/login']);
  }
}
