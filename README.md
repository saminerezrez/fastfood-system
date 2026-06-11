# FastFood System

Detta projekt är ett distribuerat backend-system inspirerat av snabbmatskedjors ordersystem.

## Teknik

- Bun
- RabbitMQ
- PostgreSQL
- Docker Compose

## Tjänster

- Product Service
- Order Service
- Kitchen Service
- Notification Service

## Starta systemet

Kör följande kommando:

```bash
docker compose up --build
```

## Testa flödet

Skicka en POST-request till:

```text
http://localhost:3001/orders
```

Exempel:

```json
{
  "customerId": "c1",
  "items": [
    {
      "productId": "p1",
      "quantity": 2,
      "price": 89
    }
  ]
}
```

När en order skapas sparas den i PostgreSQL och ett event skickas via RabbitMQ. Kitchen-service tar emot eventet och publicerar ett nytt event när maten är klar. Notification-service skickar sedan en notis till kunden.
