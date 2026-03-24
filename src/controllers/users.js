'use strict';

const config = require('../config/app-config.js');
const mysql  = require('mysql2');

const controller = class UsersController {
  constructor() {
    this.pool = mysql.createPool(config.sqlCon).promise();
  }

  async save(user) {
    const [res] = await this.pool.query('INSERT INTO users SET ?', [user]);
    return res;
  }

  async getUserByEmail(email) {
    try {
      const [rows] = await this.pool.query(
        'SELECT * FROM users WHERE email = ?', [email]
      );

      // ✅ FIX: don't throw error, return null
      if (rows.length === 0) return null;

      return rows[0];
    } catch (err) {
      console.error("DB ERROR (getUserByEmail):", err);
      throw err;
    }
  }

  async isAdmin(id) {
    try {
      const [rows] = await this.pool.query(
        'SELECT user_type FROM users WHERE id = ?', [id]
      );

      if (!rows[0]) return null;

      return rows[0].user_type;
    } catch (err) {
      console.error("DB ERROR (isAdmin):", err);
      throw err;
    }
  }

  async getUserById(id) {
    try {
      const [rows] = await this.pool.query(
        'SELECT * FROM users WHERE id = ?', [id]
      );

      if (rows.length === 0) return null;

      return rows[0];
    } catch (err) {
      console.error("DB ERROR (getUserById):", err);
      throw err;
    }
  }

  async update(name, email, userId) {
    try {
      await this.pool.query(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [name, email, userId]
      );
      return 'Success';
    } catch (err) {
      console.error("DB ERROR (update):", err);
      throw err;
    }
  }

  async updatePassword(hashed, userId) {
    try {
      await this.pool.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashed, userId]
      );
      return 'Success';
    } catch (err) {
      console.error("DB ERROR (updatePassword):", err);
      throw err;
    }
  }

  async getEmployees() {
    try {
      const [rows] = await this.pool.query(
        'SELECT * FROM users WHERE user_type IN (?, ?)',
        ['employee', 'admin']
      );
      return rows;
    } catch (err) {
      console.error("DB ERROR (getEmployees):", err);
      throw err;
    }
  }

  async updateEmployee(user, id) {
    try {
      await this.pool.query(
        'UPDATE users SET ? WHERE id = ?', [user, id]
      );
      return 'Account changes saved successfully';
    } catch (err) {
      console.error("DB ERROR (updateEmployee):", err);
      throw err;
    }
  }
};

module.exports = controller;