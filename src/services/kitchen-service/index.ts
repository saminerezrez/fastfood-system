import { subscribe } from "../../amqp/subscriber";
import { publish } from "../../amqp/publisher";
import type { OrderCreatedEvent, OrderReadyEvent } from "../../types/events";

await subscribe(
  "kitchen_service_queue",
  ["events.order.created"],
  async (_routingKey, data) => {
    const order = data as OrderCreatedEvent;

    console.log(`[kitchen-service] Preparing order ${order.orderId}`);

    await Bun.sleep(300);

    const event: OrderReadyEvent = {
      orderId: order.orderId,
      customerId: order.customerId,
      readyAt: new Date().toISOString(),
    };

    await publish("events.order.ready", event);
  },
);

console.log("[kitchen-service] Started");