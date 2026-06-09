import amqp from "amqplib";
import type { ChannelModel } from "amqplib";

let connection: ChannelModel | null = null;

const AMQP_URL = process.env.AMQP_URL || "amqp://localhost";

export const EXCHANGE = "events";

export const getConnection = async (): Promise<ChannelModel> => {
  if (connection) return connection;

  connection = await amqp.connect(AMQP_URL);

  connection.on("error", (err: Error) => {
    console.error("[amqp] Connection error:", err.message);
    connection = null;
  });

  return connection;
};

export const createChannel = async () => {
  const conn = await getConnection();
  const channel = await conn.createChannel();

  await channel.assertExchange(EXCHANGE, "topic", { durable: true });

  return channel;
};