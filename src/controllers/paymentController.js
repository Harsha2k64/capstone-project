'use strict';

const logger = require('../config/logger');

exports.processPayment = async (req, res) => {
  try {
    const { amount } = req.body;

    // ✅ Basic validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: 'failed',
        message: 'Invalid payment amount'
      });
    }

    // ✅ Simulate processing delay (real-world behavior)
    await new Promise(resolve => setTimeout(resolve, 500));

    const transactionId = "TXN" + Date.now();

    logger.info(`Payment success: ${transactionId} | Amount: ${amount}`);

    // 🚀 FUTURE: publish event (Pub/Sub)
    // TODO: integrate Pub/Sub here

    return res.json({
      status: "success",
      message: "Payment successful",
      transactionId,
      amount
    });

  } catch (err) {
    logger.error(`Payment error: ${err.message}`);

    return res.status(500).json({
      status: "failed",
      message: "Payment failed"
    });
  }
};