import type { Product } from "../types/events";

export const products: Product[] = [
  { productId: "p1", name: "Burger", price: 89 },
  { productId: "p2", name: "Fries", price: 35 },
  { productId: "p3", name: "Cola", price: 25 },
];

export function findProductById(productId: string) {
  return products.find((product) => product.productId === productId);
}
