import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ItemService } from '../../../core/services/item.service';

@Component({
  selector: 'app-item-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './item-edit.component.html',
  styleUrl: './item-edit.component.scss'
})
export class ItemEditComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly itemService = inject(ItemService);
  private readonly router = inject(Router);

  itemId: number | null = null;
  isPageLoading = true;
  isSaving = false;
  loadErrorMessage = '';
  formErrorMessage = '';

  itemForm = this.formBuilder.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    price: [null as number | null, [Validators.required, Validators.min(0.01)]],
    imageUrl: ['']
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.router.navigate(['/my-items']);
      return;
    }

    this.itemId = id;
    this.loadItem(id);
  }

  loadItem(id: number): void {
    this.isPageLoading = true;
    this.loadErrorMessage = '';

    this.itemService.getItemById(id).subscribe({
      next: (item) => {
        this.itemForm.patchValue({
          title: item.title,
          description: item.description,
          price: item.price,
          imageUrl: item.imageUrl || ''
        });
        this.isPageLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.loadErrorMessage = error.error?.message || 'Impossible de charger cet objet.';
        this.isPageLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.itemForm.invalid || !this.itemId) {
      this.itemForm.markAllAsTouched();
      this.formErrorMessage = 'Une erreur est survenue. Veuillez v�rifier le formulaire.';
      return;
    }

    this.isSaving = true;
    this.formErrorMessage = '';

    const imageUrlValue = this.itemForm.value.imageUrl?.trim();

    const request = {
      title: this.itemForm.value.title!.trim(),
      description: this.itemForm.value.description!.trim(),
      price: this.itemForm.value.price!,
      imageUrl: imageUrlValue || null
    };

    this.itemService.updateItem(this.itemId, request).subscribe({
      next: () => {
        this.router.navigate(['/my-items'], { queryParams: { feedback: 'updated' } });
      },
      error: (error) => {
        console.error(error);
        this.formErrorMessage = error.error?.message || 'Une erreur est survenue. Veuillez r�essayer.';
        this.isSaving = false;
      }
    });
  }
}
