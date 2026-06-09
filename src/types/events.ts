export type OrderItem = {
  productId: string;
  quantity: number;
  price: number;
};

export type OrderCreatedEvent = {
  orderId: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
};

export type OrderReadyEvent = {
  orderId: string;
  customerId: string;
  readyAt: string;
};