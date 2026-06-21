import { test, expect } from "bun:test";
import { calculateTotalPrice } from "../src/services/order-service";
import { OrderItem } from "../src/types/events";

test("calculate order total", () => {
  const items: OrderItem[] = [
    { productId: "1", price: 89, quantity: 2 },
    { productId: "2", price: 35, quantity: 1 },
  ];

  const total = calculateTotalPrice(items);

  expect(total).toBe(213);
});
