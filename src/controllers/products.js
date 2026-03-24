'use strict';

const config = require('../config/app-config.js');
const mysql  = require('mysql2');

const controller = class ProductsController {
  constructor() {
    this.pool = mysql.createPool(config.sqlCon).promise();
  }

  getAll() {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await this.pool.query('SELECT * FROM products');
        if (rows.length < 1) reject(new Error('No registered products'));
        else resolve(rows);
      } catch (err) { reject(err); }
    });
  }

  getAllWithSizes() {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await this.pool.query(
          'SELECT * FROM sizes JOIN products ON sizes.product_id = products.id'
        );
        if (rows.length < 1) reject(new Error('No registered products'));
        else resolve(rows);
      } catch (err) { reject(err); }
    });
  }

  getProduct(id) {
    return new Promise(async (resolve, reject) => {
      try {
        // FIXED: parameterised — was vulnerable to SQL injection
        const [rows] = await this.pool.query(
          'SELECT * FROM products JOIN sizes ON products.id = sizes.product_id WHERE products.id = ?',
          [id]
        );
        if (rows.length < 1) reject(new Error('Product not registered'));
        else resolve(rows);
      } catch (err) { reject(err); }
    });
  }

  getByIdArray(idList) {
    return new Promise(async (resolve, reject) => {
      try {
        // idList is already a comma-separated string of safe integers
        const [rows] = await this.pool.query(
          `SELECT id, title, sizes.size, sizes.price
           FROM products JOIN sizes ON products.id = sizes.product_id
           WHERE id IN (${idList})`
        );
        if (!rows) reject(new Error('Products not registered'));
        else resolve(rows);
      } catch (err) { reject(err); }
    });
  }

  checkStock(id, size) {
    return new Promise(async (resolve, reject) => {
      try {
        // FIXED: parameterised — was vulnerable to SQL injection
        const [rows] = await this.pool.query(
          'SELECT stock FROM sizes WHERE product_id = ? AND size = ?',
          [id, size]
        );
        if (rows.length < 1) reject(new Error('Product not registered'));
        else resolve(rows[0]);
      } catch (err) { reject(err); }
    });
  }

  async updateAllDetails(product, sizes, id) {
    await this.updateProduct(product, id);
    for (const size of sizes) {
      await this.updateSizes(size, id);
    }
    return 'Product updated successfully!';
  }

  updateProduct(product, id) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.pool.query('UPDATE products SET ? WHERE id = ?', [product, id]);
        resolve();
      } catch (err) { reject(err); }
    });
  }

  updateSizes(size, id) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.pool.query(
          'UPDATE sizes SET ? WHERE product_id = ? AND size = ?',
          [size, id, size.size]
        );
        resolve();
      } catch (err) { reject(err); }
    });
  }

  getPaginated(page) {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await this.pool.query(
          'SELECT * FROM products ORDER BY id ASC LIMIT 3 OFFSET ?',
          [page * 3]
        );
        if (rows.length < 1) reject(new Error('No more products'));
        else resolve(rows);
      } catch (err) { reject(err); }
    });
  }

  outOfStock() {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await this.pool.query(
          'SELECT * FROM sizes RIGHT JOIN products ON sizes.product_id = products.id WHERE sizes.stock = 0'
        );
        if (rows.length < 1) reject(new Error('All products in stock!'));
        else resolve(rows);
      } catch (err) { reject(err); }
    });
  }
};

module.exports = controller;