'use strict';

const { PubSub } = require('@google-cloud/pubsub');

const pubsub   = new PubSub({ projectId: process.env.GCP_PROJECT_ID });
const TOPIC    = process.env.PUBSUB_TOPIC_ORDERS || 'order-events';

async function publishOrderEvent(orderData) {
  // In local dev skip Pub/Sub silently
  if (process.env.NODE_ENV !== 'production') {
    console.log('[PubSub] LOCAL — skipping publish:', orderData.orderId);
    return;
  }

  try {
    const topic   = pubsub.topic(TOPIC);
    const message = Buffer.from(JSON.stringify({
      eventType: 'ORDER_PLACED',
      timestamp: new Date().toISOString(),
      data:      orderData,
    }));
    const msgId = await topic.publish(message);
    console.log(`[PubSub] Order event published: ${msgId}`);
    return msgId;
  } catch (err) {
    // NEVER let Pub/Sub failure break the order flow
    console.error('[PubSub] Failed to publish:', err.message);
  }
}

module.exports = { publishOrderEvent };