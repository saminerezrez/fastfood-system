import { subscribe } from "../../amqp/subscriber";
import type { OrderCreatedEvent, OrderReadyEvent } from "../../types/events";

await subscribe(
  "notification_service_queue",
  ["events.order.created", "events.order.ready"],
  async (routingKey, data) => {
    switch (routingKey) {
      case "events.order.created": {
        const order = data as OrderCreatedEvent;

        console.log(
          `[notification-service] Order confirmation for ${order.orderNumber} → email: ${order.customerEmail}, phone: ${order.customerPhone}`,
        );

        break;
      }

      case "events.order.ready": {
        const order = data as OrderReadyEvent;

        console.log(
          `[notification-service] Food is ready for ${order.orderNumber} → email: ${order.customerEmail}, phone: ${order.customerPhone}`,
        );

        break;
      }
    }
  },
);

console.log("[notification-service] Started");
