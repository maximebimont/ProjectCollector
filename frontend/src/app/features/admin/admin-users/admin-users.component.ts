import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-users.component.html',
  styleUrl: '../admin.component.scss'
})
export class AdminUsersComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly authService = inject(AuthService);

  users: User[] = [];
  isLoading = true;
  errorMessage = '';
  actionErrorMessage = '';
  successMessage = '';
  updatingUserId: number | null = null;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Impossible de récupérer la liste des utilisateurs.';
        this.isLoading = false;
      }
    });
  }

  isCurrentUser(user: User): boolean {
    return user.id === this.authService.getCurrentUserId();
  }

  toggleStatus(user: User): void {
    const nextEnabled = !user.enabled;
    const confirmed = window.confirm(
      nextEnabled
        ? `Réactiver le compte de ${user.firstname} ${user.lastname} ?`
        : `Désactiver le compte de ${user.firstname} ${user.lastname} ?`
    );

    if (!confirmed) {
      return;
    }

    this.updatingUserId = user.id;
    this.actionErrorMessage = '';
    this.successMessage = '';

    this.adminService.setUserEnabled(user.id, nextEnabled).subscribe({
      next: (updatedUser) => {
        user.enabled = updatedUser.enabled;
        this.successMessage = nextEnabled
          ? 'Compte réactivé avec succès.'
          : 'Compte désactivé avec succès.';
        this.updatingUserId = null;
      },
      error: (error) => {
        console.error(error);
        this.actionErrorMessage = error.error?.message || 'Une erreur est survenue. Veuillez réessayer.';
        this.updatingUserId = null;
      }
    });
  }

  trackByUserId(index: number, user: User): number {
    return user.id;
  }
}
