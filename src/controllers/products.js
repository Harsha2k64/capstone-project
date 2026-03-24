'use strict';

const sql = require('mssql');
const config = require('../config/app-config');

const controller = class ProductsController {

  async getAll() {
    try {
      const pool = await sql.connect(config.sqlCon);
      const result = await pool.request().query('SELECT * FROM products');

      if (result.recordset.length < 1) {
        throw new Error('No registered products');
      }

      return result.recordset;
    } catch (err) {
      throw err;
    }
  }

  async getAllWithSizes() {
    try {
      const pool = await sql.connect(config.sqlCon);
      const result = await pool.request().query(`
        SELECT * 
        FROM sizes 
        JOIN products ON sizes.product_id = products.id
      `);

      if (result.recordset.length < 1) {
        throw new Error('No registered products');
      }

      return result.recordset;
    } catch (err) {
      throw err;
    }
  }

  async getProduct(id) {
    try {
      const pool = await sql.connect(config.sqlCon);
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
          SELECT * 
          FROM products 
          JOIN sizes ON products.id = sizes.product_id 
          WHERE products.id = @id
        `);

      if (result.recordset.length < 1) {
        throw new Error('Product not registered');
      }

      return result.recordset;
    } catch (err) {
      throw err;
    }
  }

  async getByIdArray(idList) {
    try {
      const pool = await sql.connect(config.sqlCon);

      const result = await pool.request().query(`
        SELECT products.id, products.title, sizes.size, sizes.price
        FROM products 
        JOIN sizes ON products.id = sizes.product_id
        WHERE products.id IN (${idList})
      `);

      return result.recordset;
    } catch (err) {
      throw err;
    }
  }

  async checkStock(id, size) {
    try {
      const pool = await sql.connect(config.sqlCon);
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('size', sql.NVarChar, size)
        .query(`
          SELECT stock 
          FROM sizes 
          WHERE product_id = @id AND size = @size
        `);

      if (result.recordset.length < 1) {
        throw new Error('Product not registered');
      }

      return result.recordset[0];
    } catch (err) {
      throw err;
    }
  }

  async updateProduct(product, id) {
    try {
      const pool = await sql.connect(config.sqlCon);

      await pool.request()
        .input('id', sql.Int, id)
        .input('title', sql.NVarChar, product.title)
        .input('description', sql.NVarChar, product.description)
        .query(`
          UPDATE products 
          SET title = @title, description = @description
          WHERE id = @id
        `);

      return;
    } catch (err) {
      throw err;
    }
  }

  async updateSizes(size, id) {
    try {
      const pool = await sql.connect(config.sqlCon);

      await pool.request()
        .input('id', sql.Int, id)
        .input('size', sql.NVarChar, size.size)
        .input('price', sql.Decimal(10,2), size.price)
        .input('stock', sql.Int, size.stock)
        .query(`
          UPDATE sizes 
          SET price = @price, stock = @stock
          WHERE product_id = @id AND size = @size
        `);

      return;
    } catch (err) {
      throw err;
    }
  }

  async getPaginated(page) {
    try {
      const pool = await sql.connect(config.sqlCon);

      const offset = page * 3;

      const result = await pool.request()
        .input('offset', sql.Int, offset)
        .query(`
          SELECT * 
          FROM products 
          ORDER BY id ASC
          OFFSET @offset ROWS FETCH NEXT 3 ROWS ONLY
        `);

      if (result.recordset.length < 1) {
        throw new Error('No more products');
      }

      return result.recordset;
    } catch (err) {
      throw err;
    }
  }

  async outOfStock() {
    try {
      const pool = await sql.connect(config.sqlCon);

      const result = await pool.request().query(`
        SELECT * 
        FROM sizes 
        RIGHT JOIN products ON sizes.product_id = products.id 
        WHERE sizes.stock = 0
      `);

      if (result.recordset.length < 1) {
        throw new Error('All products in stock!');
      }

      return result.recordset;
    } catch (err) {
      throw err;
    }
  }
};

module.exports = controller;