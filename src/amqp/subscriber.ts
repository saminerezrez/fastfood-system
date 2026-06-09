import { createChannel, EXCHANGE } from ".";

type MessageHandler = (
  routingKey: string,
  data: unknown
) => Promise<void>;

export const subscribe = async (
  queueName: string,
  routingKeys: string[],
  handler: MessageHandler
): Promise<void> => {
  const channel = await createChannel();

  await channel.assertQueue(queueName, {
    durable: true
  });

  for (const key of routingKeys) {
    await channel.bindQueue(queueName, EXCHANGE, key);
  }

  console.log(
    `[subscriber] "${queueName}" bound to: ${routingKeys.join(", ")}`
  );

  channel.consume(queueName, async (msg) => {
    if (!msg) return;

    const data = JSON.parse(msg.content.toString()) as unknown;
    const routingKey = msg.fields.routingKey;

    try {
      await handler(routingKey, data);
      channel.ack(msg);
    } catch (err) {
      console.error(`[subscriber] Failed to handle "${routingKey}":`, err);
      channel.nack(msg, false, false);
    }
  });
};