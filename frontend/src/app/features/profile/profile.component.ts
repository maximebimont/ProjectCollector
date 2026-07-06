import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CardModule, MessageModule, ProgressSpinnerModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  readonly fallbackValue = 'Non renseigné';

  user: User | null = null;
  isLoading = true;
  errorMessage = '';

  readonly quickLinks = [
    {
      title: 'Mes objets',
      description: 'Retrouvez vos annonces, modifiez-les ou supprimez-les.',
      route: '/my-items',
      icon: 'pi pi-box',
      actionLabel: 'Gérer mes annonces'
    },
    {
      title: 'Mes achats',
      description: 'Consultez les commandes que vous avez passées sur Collector.',
      route: '/my-purchases',
      icon: 'pi pi-shopping-bag',
      actionLabel: 'Voir mes commandes'
    },
    {
      title: 'Mes ventes',
      description: 'Suivez les ventes réalisées sur vos objets de collection.',
      route: '/my-sales',
      icon: 'pi pi-chart-line',
      actionLabel: 'Suivre mes ventes'
    }
  ];

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Impossible de charger votre espace utilisateur.';
        this.isLoading = false;
      }
    });
  }

  getDisplayValue(value: string | null | undefined): string {
    return value?.trim() || this.fallbackValue;
  }
}
