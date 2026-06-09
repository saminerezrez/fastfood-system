import { createChannel, EXCHANGE } from ".";

export const publish = async <T>(
  routingKey: string,
  data: T
): Promise<void> => {
  const channel = await createChannel();

  channel.publish(
    EXCHANGE,
    routingKey,
    Buffer.from(JSON.stringify(data))
  );

  console.log(`[publisher] → "${routingKey}"`, data);
};