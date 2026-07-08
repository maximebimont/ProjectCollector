import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ButtonModule, ToastModule, ConfirmDialogModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  authService = inject(AuthService);
  private readonly router = inject(Router);
  mobileMenuOpen = signal(false);

  logout(): void {
    this.mobileMenuOpen.set(false);
    this.authService.logout();
  }

  closeMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  toggleMenu(): void {
    this.mobileMenuOpen.update((value) => !value);
  }

  isUserSpaceRoute(): boolean {
    const currentPath = this.router.url.split('?')[0];

    return ['/profile', '/my-items', '/my-purchases', '/my-sales']
      .some((route) => currentPath === route || currentPath.startsWith(`${route}/`));
  }
}
