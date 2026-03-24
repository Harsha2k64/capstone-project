'use strict';

const sql = require('mssql');
const config = require('../config/app-config.js');

const controller = class CartController {

  // 🟢 Get cart content
  async getContent(userId) {
    const pool = await sql.connect(config.sqlCon);

    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT content FROM cart WHERE user_id = @userId');

    if (result.recordset.length === 0) {
      return { content: [] };
    }

    let content = result.recordset[0].content;

    try {
      content = content ? JSON.parse(content) : [];
    } catch {
      content = [];
    }

    return { content };
  }

  // 🟢 Add to cart
  async addToCart(newProducts, userId) {
    const pool = await sql.connect(config.sqlCon);

    let cartData = await this.getContent(userId);
    let cartProducts = cartData.content;

    // merge logic
    for (const cartProduct of cartProducts) {
      for (const newProduct of newProducts) {
        if (cartProduct.id == newProduct.id && cartProduct.size == newProduct.size) {
          cartProduct.quantity += newProduct.quantity;
          const index = newProducts.indexOf(newProduct);
          newProducts.splice(index, 1);
        }
      }
    }

    const finalProducts = JSON.stringify(cartProducts.concat(newProducts));

    // check if exists
    const check = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT user_id FROM cart WHERE user_id = @userId');

    if (check.recordset.length === 0) {
      await pool.request()
        .input('userId', sql.Int, userId)
        .input('content', sql.NVarChar(sql.MAX), finalProducts)
        .query('INSERT INTO cart (user_id, content) VALUES (@userId, @content)');
    } else {
      await pool.request()
        .input('userId', sql.Int, userId)
        .input('content', sql.NVarChar(sql.MAX), finalProducts)
        .query('UPDATE cart SET content = @content WHERE user_id = @userId');
    }

    return 'Added to the cart!';
  }

  // 🟢 Update cart
  async update(updateProduct, userId) {
    const pool = await sql.connect(config.sqlCon);

    let cartData = await this.getContent(userId);
    let cartProducts = cartData.content;

    let found = false;

    for (const cartProduct of cartProducts) {
      if (cartProduct.id == updateProduct.id && cartProduct.size == updateProduct.size) {
        found = true;

        if (updateProduct.quantity > 0) {
          cartProduct.quantity = updateProduct.quantity;
        } else {
          cartProducts.splice(cartProducts.indexOf(cartProduct), 1);
        }
      }
    }

    if (!found) {
      cartProducts.push(updateProduct);
    }

    await pool.request()
      .input('userId', sql.Int, userId)
      .input('content', sql.NVarChar(sql.MAX), JSON.stringify(cartProducts))
      .query('UPDATE cart SET content = @content WHERE user_id = @userId');

    return 'Cart updated!';
  }

  // 🟢 Empty cart
  async empty(userId) {
    const pool = await sql.connect(config.sqlCon);

    await pool.request()
      .input('userId', sql.Int, userId)
      .query('DELETE FROM cart WHERE user_id = @userId');

    return 'Cart emptied';
  }
};

module.exports = controller;