import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

export interface ItemFormControls {
  title: FormControl<string | null>;
  description: FormControl<string | null>;
  price: FormControl<number | null>;
  imageUrl: FormControl<string | null>;
}

@Component({
  selector: 'app-item-form-fields',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './item-form-fields.component.html',
  styleUrl: './item-form-fields.component.scss'
})
export class ItemFormFieldsComponent {
  @Input({ required: true }) form!: FormGroup<ItemFormControls>;
}
