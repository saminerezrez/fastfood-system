import { subscribe } from "../../amqp/subscriber";
import { publish } from "../../amqp/publisher";
import type { OrderCreatedEvent, OrderReadyEvent } from "../../types/events";

const PORT = parseInt(process.env.PORT ?? "3003");

const activeOrders = new Map<string, OrderCreatedEvent>();

await subscribe(
  "kitchen_service_queue",
  ["events.order.created"],
  async (_routingKey, data) => {
    const order = data as OrderCreatedEvent;

    activeOrders.set(order.orderId, order);

    console.log(`[kitchen-service] New order received: ${order.orderNumber}`);
  },
);

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "GET" && url.pathname === "/kitchen/orders") {
      return Response.json({
        success: true,
        orders: Array.from(activeOrders.values()),
      });
    }

    const readyMatch = url.pathname.match(
      /^\/kitchen\/orders\/([^/]+)\/ready$/,
    );

    if (req.method === "POST" && readyMatch) {
      const orderId = readyMatch[1];
      const order = activeOrders.get(orderId);

      if (!order) {
        return Response.json(
          { success: false, error: "Order not found in kitchen" },
          { status: 404 },
        );
      }

      const event: OrderReadyEvent = {
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        readyAt: new Date().toISOString(),
      };

      await publish("events.order.ready", event);

      activeOrders.delete(orderId);

      console.log(
        `[kitchen-service] Order marked as ready: ${order.orderNumber}`,
      );

      return Response.json({
        success: true,
        message: "Order marked as ready",
        order: event,
      });
    }

    return Response.json(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  },
});

console.log(`[kitchen-service] HTTP API listening on http://localhost:${PORT}`);
console.log("[kitchen-service] Started");
