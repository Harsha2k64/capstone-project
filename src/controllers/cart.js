'use strict';

const config = require('../config/app-config.js');
const mysql  = require('mysql2');

const controller = class CartController {
  constructor() {
    this.pool = mysql.createPool(config.sqlCon).promise();
  }

  getContent(userId) {
    return new Promise(async (resolve, reject) => {
      try {
        // FIXED: parameterised query
        const [rows] = await this.pool.query(
          'SELECT content FROM cart WHERE user_id = ?', [userId]
        );
        if (!rows[0]) reject(new Error('Cart not found'));
        else resolve(rows[0]);
      } catch (err) { reject(err); }
    });
  }

  addToCart(newProducts, userId) {
    return new Promise(async (resolve, reject) => {
      try {
        let cartContent = await this.getContent(userId);
        let cartProducts = cartContent.content;

        for (const cartProduct of cartProducts) {
          for (const newProduct of newProducts) {
            if (cartProduct.id == newProduct.id && cartProduct.size == newProduct.size) {
              cartProduct.quantity = newProduct.quantity + cartProduct.quantity;
              const index = newProducts.indexOf(newProduct);
              newProducts.splice(index, 1);
            }
          }
        }

        const merged = JSON.stringify(cartProducts.concat(newProducts));
        await this.pool.query(
          'UPDATE cart SET content = ? WHERE user_id = ?', [merged, userId]
        );
        resolve('Added to the cart!');
      } catch {
        // Cart row does not exist yet — create it
        try {
          await this.pool.query(
            'INSERT INTO cart (user_id, content) VALUES (?, ?)',
            [userId, JSON.stringify(newProducts)]
          );
          resolve('Added to the cart!');
        } catch (err) { reject(err); }
      }
    });
  }

  update(updateProduct, userId) {
    return new Promise(async (resolve, reject) => {
      try {
        let cartContent  = await this.getContent(userId);
        let cartProducts = cartContent.content;
        let found        = false;

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

        if (!found) cartProducts.push(updateProduct);

        await this.pool.query(
          'UPDATE cart SET content = ? WHERE user_id = ?',
          [JSON.stringify(cartProducts), userId]
        );
        resolve('Cart updated!');
      } catch (err) { reject(err); }
    });
  }

  empty(userId) {
    return new Promise(async (resolve, reject) => {
      try {
        // FIXED: parameterised query
        await this.pool.query('DELETE FROM cart WHERE user_id = ?', [userId]);
        resolve('Cart emptied');
      } catch (err) { reject(err); }
    });
  }
};

module.exports = controller;