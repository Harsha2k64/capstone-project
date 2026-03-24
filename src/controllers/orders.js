'use strict';

const sql = require('mssql');
const config = require('../config/app-config.js');

const controller = class OrdersController {

  // 🟢 Create order
  async create(orderData) {
    try {
      const pool = await sql.connect(config.sqlCon);

      const result = await pool.request()
        .input('customer_id', sql.Int, orderData.costumer_id)
        .query(`
          INSERT INTO orders (costumer_id)
          OUTPUT INSERTED.id
          VALUES (@customer_id)
        `);

      return result.recordset[0].id;

    } catch (err) {
      throw err;
    }
  }

  // 🟢 Save order items
  async saveOrderProducts(orderId, cartContent) {
    try {
      const pool = await sql.connect(config.sqlCon);

      for (const item of cartContent) {
        await pool.request()
          .input('order_id', sql.Int, orderId)
          .input('item_id', sql.Int, parseInt(item.id))
          .input('quantity', sql.Int, item.quantity)
          .input('size', sql.NVarChar, item.size)
          .query(`
            INSERT INTO orders_items (order_id, item_id, quantity, size)
            VALUES (@order_id, @item_id, @quantity, @size)
          `);
      }

      return 'Order items saved';

    } catch (err) {
      throw err;
    }
  }

  // 🟢 Get order with items
  async getOrderWithItems(orderId) {
    try {
      const pool = await sql.connect(config.sqlCon);

      const result = await pool.request()
        .input('orderId', sql.Int, orderId)
        .query(`
          SELECT 
            o.id,
            o.costumer_id,
            p.title AS product_name,
            oi.quantity,
            oi.size,
            s.price
          FROM orders o
          JOIN orders_items oi ON o.id = oi.order_id
          JOIN products p ON oi.item_id = p.id
          JOIN sizes s ON s.product_id = p.id AND s.size = oi.size
          WHERE o.id = @orderId
        `);

      return result.recordset;

    } catch (err) {
      throw err;
    }
  }

  // 🟢 Get all orders (Admin)
  async getAllOrders() {
    try {
      const pool = await sql.connect(config.sqlCon);

      const result = await pool.request().query(`
        SELECT 
          o.*, 
          u.name AS customer_name, 
          u.email AS customer_email
        FROM orders o
        JOIN users u ON o.costumer_id = u.id
        ORDER BY o.id DESC
      `);

      return result.recordset;

    } catch (err) {
      throw err;
    }
  }
};

module.exports = controller;