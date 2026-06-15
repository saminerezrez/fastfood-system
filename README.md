# FastFood System

Detta projekt är ett distribuerat backend-system inspirerat av hur snabbmatskedjors ordersystem fungerar. Systemet använder en eventdriven arkitektur där tjänster kommunicerar med varandra via RabbitMQ.

## Teknik

- Bun
- TypeScript
- RabbitMQ
- PostgreSQL
- Docker Compose
- Nginx

## Tjänster

- **Product Service** – visar produkter och menyer.
- **Order Service** – tar emot beställningar, sparar dem i PostgreSQL och publicerar ett event.
- **Kitchen Service** – tar emot order-event och markerar när maten är klar.
- **Notification Service** – skickar notiser när en order skapas och när maten är färdig.

## Arkitektur

Systemet använder RabbitMQ för intern kommunikation mellan tjänsterna.

```text
Client
   ↓
Nginx
   ↓
Order Service
   ↓
PostgreSQL
   ↓
RabbitMQ (events.order.created)
   ↓
Kitchen Service
   ↓
RabbitMQ (events.order.ready)
   ↓
Notification Service
```

## Starta systemet

Starta alla tjänster med:

```bash
docker compose up --build
```

## Testa systemet

Skicka en POST-request till:

```text
http://localhost/orders
```

Exempel på request body:

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

När en order skapas:

1. Ordern sparas i PostgreSQL.
2. Ett `events.order.created`-event skickas via RabbitMQ.
3. Kitchen Service tar emot eventet och förbereder ordern.
4. Kitchen Service publicerar `events.order.ready`.
5. Notification Service skickar en notis till kunden.

## Tester

Projektet innehåller ett enkelt test som kan köras med:

```bash
bun test
```

## CI

Projektet använder GitHub Actions för att automatiskt köra tester vid varje push till `main`.
