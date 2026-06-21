import { products } from "../../products/catalog";

const PORT = parseInt(process.env.PORT ?? "3002");

Bun.serve({
  port: PORT,
  routes: {
    "/products": {
      GET: () => {
        return Response.json(products);
      },
    },
  },
});

console.log(`[product-service] Listening on http://localhost:${PORT}`);
console.log("[product-service] GET /products");
