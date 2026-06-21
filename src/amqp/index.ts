import amqp from "amqplib";
import type { ChannelModel } from "amqplib";

let connection: ChannelModel | null = null;

const AMQP_URL = process.env.AMQP_URL || "amqp://localhost";

export const EXCHANGE = "events";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getConnection = async (): Promise<ChannelModel> => {
  if (connection) return connection;

  const maxRetries = 20;
  const delayMs = 1500;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      connection = await amqp.connect(AMQP_URL);

      connection.on("error", (err: Error) => {
        console.error("[amqp] Connection error:", err.message);
        connection = null;
      });

      connection.on("close", () => {
        console.error("[amqp] Connection closed");
        connection = null;
      });

      console.log("[amqp] Connected to RabbitMQ");
      return connection;
    } catch (err) {
      console.log(
        `[amqp] RabbitMQ not ready yet, retry ${attempt}/${maxRetries}`,
      );

      if (attempt === maxRetries) {
        throw err;
      }

      await sleep(delayMs);
    }
  }

  throw new Error("Could not connect to RabbitMQ");
};

export const createChannel = async () => {
  const conn = await getConnection();
  const channel = await conn.createChannel();

  await channel.assertExchange(EXCHANGE, "topic", { durable: true });

  return channel;
};
