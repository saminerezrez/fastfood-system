import { Client } from "pg";

export const db = new Client({
  host: process.env.POSTGRES_HOST ?? "localhost",
port: parseInt(process.env.POSTGRES_PORT ?? "55432"),
  user: process.env.POSTGRES_USER ?? "postgres",
  password: process.env.POSTGRES_PASSWORD ?? "postgres",
  database: process.env.POSTGRES_DB ?? "fastfood",
});

export async function connectDb() {
  await db.connect();

  await db.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      total INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  console.log("[db] Connected and orders table ready");
}