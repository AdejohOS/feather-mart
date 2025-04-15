export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  discountPrice?: number | null;
  quantity: number;
  unit: string;
  minimumOrder?: number | null;
  image?: string | null;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
}
