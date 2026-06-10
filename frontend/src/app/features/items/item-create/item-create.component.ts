import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ItemService } from '../../../core/services/item.service';

@Component({
  selector: 'app-item-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './item-create.component.html',
  styleUrl: './item-create.component.scss'
})
export class ItemCreateComponent {
  private formBuilder = inject(FormBuilder);
  private itemService = inject(ItemService);
  private router = inject(Router);

  errorMessage = '';
  isLoading = false;

  itemForm = this.formBuilder.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    price: [null as number | null, [Validators.required, Validators.min(0.01)]],
    imageUrl: ['']
  });

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const imageUrlValue = this.itemForm.value.imageUrl?.trim();

    const request = {
      title: this.itemForm.value.title!.trim(),
      description: this.itemForm.value.description!.trim(),
      price: this.itemForm.value.price!,
      imageUrl: imageUrlValue ? imageUrlValue : null
    };

    this.itemService.createItem(request).subscribe({
      next: () => {
        this.router.navigate(['/items']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erreur lors de la création de l’objet.';
        this.isLoading = false;
      }
    });
  }
}
