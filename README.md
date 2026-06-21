# FastFood System

Det här projektet är ett distribuerat backend-system inspirerat av hur ett ordersystem på till exempel Max eller McDonald's kan fungera.

Systemet körs med Docker Compose och består av flera tjänster som kommunicerar internt med RabbitMQ. All trafik från frontend går via en gemensam publik ingång med Nginx på port 80.

## Teknik

- Bun
- TypeScript
- Docker Compose
- Nginx
- RabbitMQ
- PostgreSQL
- GitHub Actions

## Tjänster

Systemet innehåller:

- **product-service** – returnerar produkter och menyer.
- **order-service** – tar emot och hanterar ordrar, räknar totalpris och sparar ordern i PostgreSQL.
- **kitchen-service** – används av köket/personalen för att se ordrar och markera dem som klara.
- **notification-service** – hanterar notiser till kunden genom att lyssna på events.
- **rabbitmq** – används för intern eventdriven kommunikation mellan tjänsterna.
- **postgres** – används för att spara ordrar.
- **nginx** – är den enda publika ingången till systemet.

## Starta systemet

Starta hela systemet med ett kommando:

```bash
docker compose up -d --build
```

Kontrollera att tjänsterna kör:

```bash
docker compose ps
```

Nginx ska vara den enda tjänsten som exponeras publikt:

```text
0.0.0.0:80->80/tcp
```

De andra tjänsterna körs bara internt i Docker-nätverket.

## Publik väg in i systemet

All extern trafik går via:

```text
http://localhost
```

Publika endpoints:

```text
GET  /products
POST /orders
GET  /kitchen/orders
POST /kitchen/orders/:orderId/ready
```

## Kort arkitektur

```text
Client / Frontend
      ↓
    Nginx
      ↓
Order Service
      ↓
PostgreSQL

Order Service
      ↓
RabbitMQ: events.order.created
      ↓
Kitchen Service
      ↓
RabbitMQ: events.order.ready
      ↓
Notification Service
```

## Testa flödet

### 1. Hämta produkter

Terminal:

```bash
curl http://localhost/products
```

Postman:

```text
GET http://localhost/products
```

### 2. Skapa en order

URL:

```text
POST http://localhost/orders
```

Body:

```json
{
  "customerId": "c1",
  "customerEmail": "customer@example.com",
  "customerPhone": "0701234567",
  "items": [
    {
      "productId": "p1",
      "quantity": 2
    },
    {
      "productId": "p2",
      "quantity": 1
    }
  ]
}
```

Order-service räknar priset på serversidan från produktkatalogen. Frontend skickar bara `productId` och `quantity`, inte priset.

Förväntad total:

```text
Burger: 89 × 2 = 178
Fries: 35 × 1 = 35
Total = 213
```

Ordern får också ett unikt `orderNumber`.

### 3. Visa ordrar i köket

Terminal:

```bash
curl http://localhost/kitchen/orders
```

Postman:

```text
GET http://localhost/kitchen/orders
```

### 4. Markera order som klar

Byt ut `ORDER_ID` mot ett riktigt orderId från listan.

Terminal:

```bash
curl -X POST http://localhost/kitchen/orders/ORDER_ID/ready
```

Postman:

```text
POST http://localhost/kitchen/orders/ORDER_ID/ready
```

När ordern markeras som klar skickas eventet `events.order.ready`, och notification-service tar emot eventet.

## Events

Systemet använder följande events:

```text
events.order.created
events.order.ready
```

## Databas

Order-service skapar databastabellen vid start om den inte redan finns. Ordrar sparas i PostgreSQL.

Produktlistan finns i product-service och används som enkel seed-data.

## Tester

Kör testerna med:

```bash
bun test
```

Förväntat resultat:

```text
1 pass
0 fail
```

## CI

Projektet använder GitHub Actions. Tester körs automatiskt vid push till `main`.

## Felscenario

Ett felscenario är att RabbitMQ inte är helt redo när tjänsterna startar. Därför finns retry-logik i AMQP-anslutningen.

Exempel:

```text
[amqp] RabbitMQ not ready yet, retry 1/20
[amqp] Connected to RabbitMQ
```

Det gör att tjänsterna väntar tills RabbitMQ är redo i stället för att krascha permanent.
