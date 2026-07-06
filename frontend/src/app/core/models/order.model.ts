export type OrderStatus = 'COMPLETED' | 'CANCELLED';

export interface Order {
  id: number;

  itemId: number;
  itemTitle: string;
  itemImageUrl: string | null;

  buyerId: number;
  buyerFirstname: string;
  buyerLastname: string;

  sellerId: number;
  sellerFirstname: string;
  sellerLastname: string;

  itemPrice: number;
  platformFee: number;
  sellerAmount: number;
  totalAmount: number;

  status: OrderStatus;
  createdAt: string;
}