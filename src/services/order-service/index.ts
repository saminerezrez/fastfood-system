import { publish } from "../../amqp/publisher";
import type { OrderCreatedEvent, OrderItem } from "../../types/events";
import { connectDb, db } from "../../db";

await connectDb();
const PORT = parseInt(process.env.PORT ?? "3001");

type CreateOrderBody = {
  customerId: string;
  items: OrderItem[];
};

Bun.serve({
  port: PORT,
  routes: {
    "/orders": {
      POST: async (req) => {
        const body = (await req.json()) as CreateOrderBody;

        const order: OrderCreatedEvent = {
          orderId: crypto.randomUUID(),
          customerId: body.customerId,
          items: body.items,
          total: body.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          ),
          createdAt: new Date().toISOString(),
        };

await db.query(
  `
  INSERT INTO orders (id, customer_id, total, created_at)
  VALUES ($1, $2, $3, $4)
  `,
  [order.orderId, order.customerId, order.total, order.createdAt]
);
        await publish("events.order.created", order);

        return Response.json({ success: true, order }, { status: 201 });
      },
    },
  },
});

console.log(`[order-service] Listening on http://localhost:${PORT}`);
console.log("[order-service] POST /orders to create an order");