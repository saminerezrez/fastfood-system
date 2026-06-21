export type Product = {
  productId: string;
  name: string;
  price: number;
};

export type OrderRequestItem = {
  productId: string;
  quantity: number;
};

export type OrderItem = {
  productId: string;
  name?: string;
  price: number;
  quantity: number;
};

export type OrderCreatedEvent = {
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
};

export type OrderReadyEvent = {
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  readyAt: string;
};
