const PORT = parseInt(process.env.PORT ?? "3002");

const products = [
  { productId: "p1", name: "Burger", price: 89 },
  { productId: "p2", name: "Fries", price: 35 },
  { productId: "p3", name: "Cola", price: 25 }
];

Bun.serve({
  port: PORT,
  routes: {
    "/products": {
      GET: () => {
        return Response.json(products);
      }
    }
  }
});

console.log(`[product-service] Listening on http://localhost:${PORT}`);
console.log("[product-service] GET /products");