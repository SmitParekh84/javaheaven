export interface IMenuItemBase {
  tenantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  isAvailable: boolean;
}

export interface IOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  qty: number;
  size: string;
}

export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface IOrderBase {
  userId: string;
  tenantId: string;
  items: IOrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
}

export interface ICartItem {
  menuItemId: string;
  name: string;
  price: number;
  qty: number;
  size: string;
  imageUrl?: string;
}

export interface ICartBase {
  userId: string;
  tenantId: string;
  items: ICartItem[];
}

export interface IUserProfileBase {
  userId: string;
  tenantId: string;
  name: string;
  phone: string;
  address: string;
}
