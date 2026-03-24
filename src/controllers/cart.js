'use strict';

const sql = require('mssql');
const config = require('../config/app-config.js');

const controller = class CartController {

  constructor() {
    this.pool = new sql.ConnectionPool(config.sqlCon);
    this.poolConnect = this.pool.connect();
  }

  // 🟢 Get cart content
  async getContent(userId) {
    await this.poolConnect;

    const result = await this.pool.request()
      .input('userId', sql.NVarChar(50), userId)
      .query('SELECT content FROM cart WHERE user_id = @userId');

    if (result.recordset.length === 0) {
      return { content: [] };
    }

    return {
      content: JSON.parse(result.recordset[0].content || '[]')
    };
  }

  // 🟢 Add to cart
  async addToCart(newProducts, userId) {
    await this.poolConnect;

    let cartData = await this.getContent(userId);
    let cartProducts = cartData.content;

    // merge logic (same as your old logic)
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

    // check if user exists
    const check = await this.pool.request()
      .input('userId', sql.NVarChar, userId)
      .query('SELECT user_id FROM cart WHERE user_id = @userId');

    if (check.recordset.length === 0) {
      // insert
      await this.pool.request()
        .input('userId', sql.NVarChar, userId)
        .input('content', sql.NVarChar, finalProducts)
        .query('INSERT INTO cart (user_id, content) VALUES (@userId, @content)');
    } else {
      // update
      await this.pool.request()
        .input('userId', sql.NVarChar, userId)
        .input('content', sql.NVarChar, finalProducts)
        .query('UPDATE cart SET content = @content WHERE user_id = @userId');
    }

    return 'Added to the cart!';
  }

  // 🟢 Update cart
  async update(updateProduct, userId) {
    await this.poolConnect;

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

    await this.pool.request()
      .input('userId', sql.NVarChar, userId)
      .input('content', sql.NVarChar, JSON.stringify(cartProducts))
      .query('UPDATE cart SET content = @content WHERE user_id = @userId');

    return 'Cart updated!';
  }

  // 🟢 Empty cart
  async empty(userId) {
    await this.poolConnect;

    await this.pool.request()
      .input('userId', sql.NVarChar, userId)
      .query('DELETE FROM cart WHERE user_id = @userId');

    return 'Cart emptied';
  }
};

module.exports = controller;
