import { subscribe } from "../../amqp/subscriber";
import type {
  OrderCreatedEvent,
  OrderReadyEvent,
} from "../../types/events";

await subscribe(
  "notification_service_queue",
  [
    "events.order.created",
    "events.order.ready"
  ],
  async (routingKey, data) => {
    switch (routingKey) {
      case "events.order.created": {
        const order = data as OrderCreatedEvent;

        console.log(
          `[notification-service] Order confirmation → customer ${order.customerId}`
        );

        break;
      }

      case "events.order.ready": {
        const order = data as OrderReadyEvent;

        console.log(
          `[notification-service] Food is ready → customer ${order.customerId}`
        );

        break;
      }
    }
  }
);

console.log("[notification-service] Started");