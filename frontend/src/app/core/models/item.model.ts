export type ItemStatus = 'AVAILABLE' | 'SOLD';

export interface Item {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  status: ItemStatus;
  sellerId: number;
  sellerFirstname: string;
  sellerLastname: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface ItemRequest {
  title: string;
  description: string;
  price: number;
  imageUrl?: string | null;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
}