import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-card.component.html',
  styleUrl: './order-card.component.scss'
})
export class OrderCardComponent {
  @Input() imageUrl: string | null = null;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) cancelled!: boolean;
  @Input({ required: true }) statusLabel!: string;
}
