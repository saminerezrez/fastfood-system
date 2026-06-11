import { test, expect } from "bun:test";

test("calculate order total", () => {
  const items = [
    { price: 89, quantity: 2 },
    { price: 35, quantity: 1 },
  ];

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  expect(total).toBe(213);
});