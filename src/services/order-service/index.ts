import { publish } from "../../amqp/publisher";
import type {
  OrderCreatedEvent,
  OrderItem,
  OrderRequestItem,
} from "../../types/events";
import { connectDb, db } from "../../db";
import { findProductById } from "../../products/catalog";

export const calculateTotalPrice = (items: OrderItem[]) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

const generateOrderNumber = () => {
  return `FF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

type CreateOrderBody = {
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderRequestItem[];
};

function buildOrderItems(requestItems: OrderRequestItem[]): OrderItem[] {
  return requestItems.map((item) => {
    const product = findProductById(item.productId);

    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    if (item.quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    return {
      productId: product.productId,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
    };
  });
}

export async function startOrderService() {
  await connectDb();

  const PORT = parseInt(process.env.PORT ?? "3001");

  Bun.serve({
    port: PORT,
    routes: {
      "/orders": {
        POST: async (req) => {
          try {
            const body = (await req.json()) as CreateOrderBody;

            if (
              !body.customerId ||
              !body.customerEmail ||
              !body.customerPhone ||
              !body.items ||
              body.items.length === 0
            ) {
              return Response.json(
                {
                  success: false,
                  error:
                    "customerId, customerEmail, customerPhone and items are required",
                },
                { status: 400 },
              );
            }

            const items = buildOrderItems(body.items);

            const order: OrderCreatedEvent = {
              orderId: crypto.randomUUID(),
              orderNumber: generateOrderNumber(),
              customerId: body.customerId,
              customerEmail: body.customerEmail,
              customerPhone: body.customerPhone,
              items,
              total: calculateTotalPrice(items),
              createdAt: new Date().toISOString(),
            };

            await db.query(
              `
              INSERT INTO orders (
                id,
                order_number,
                customer_id,
                customer_email,
                customer_phone,
                total,
                created_at
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7)
              `,
              [
                order.orderId,
                order.orderNumber,
                order.customerId,
                order.customerEmail,
                order.customerPhone,
                order.total,
                order.createdAt,
              ],
            );

            await publish("events.order.created", order);

            return Response.json({ success: true, order }, { status: 201 });
          } catch (error) {
            return Response.json(
              {
                success: false,
                error:
                  error instanceof Error
                    ? error.message
                    : "Could not create order",
              },
              { status: 400 },
            );
          }
        },
      },
    },
  });

  console.log(`[order-service] Listening on http://localhost:${PORT}`);
  console.log("[order-service] POST /orders to create an order");
}

if (import.meta.main) {
  await startOrderService();
}
