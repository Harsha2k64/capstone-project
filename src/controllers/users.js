'use strict';

const sql = require('mssql');
const config = require('../config/app-config.js');

const controller = class UsersController {

  // 🟢 Create user
  async save(user) {
    try {
      const pool = await sql.connect(config.sqlCon);

      const result = await pool.request()
        .input('user_type', sql.NVarChar, user.user_type || null)
        .input('name', sql.NVarChar, user.name)
        .input('password', sql.NVarChar, user.password)
        .input('email', sql.NVarChar, user.email)
        .query(`
          INSERT INTO users (user_type, name, password, email)
          OUTPUT INSERTED.id
          VALUES (@user_type, @name, @password, @email)
        `);

      return result.recordset[0];

    } catch (err) {
      console.error("DB ERROR (save):", err);
      throw err;
    }
  }

  // 🟢 Get by email
  async getUserByEmail(email) {
    try {
      const pool = await sql.connect(config.sqlCon);

      const result = await pool.request()
        .input('email', sql.NVarChar, email)
        .query('SELECT * FROM users WHERE email = @email');

      if (result.recordset.length === 0) return null;

      return result.recordset[0];

    } catch (err) {
      console.error("DB ERROR (getUserByEmail):", err);
      throw err;
    }
  }

  // 🟢 Check admin
  async isAdmin(id) {
    try {
      const pool = await sql.connect(config.sqlCon);

      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT user_type FROM users WHERE id = @id');

      if (!result.recordset[0]) return null;

      return result.recordset[0].user_type;

    } catch (err) {
      console.error("DB ERROR (isAdmin):", err);
      throw err;
    }
  }

  // 🟢 Get by ID
  async getUserById(id) {
    try {
      const pool = await sql.connect(config.sqlCon);

      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM users WHERE id = @id');

      if (result.recordset.length === 0) return null;

      return result.recordset[0];

    } catch (err) {
      console.error("DB ERROR (getUserById):", err);
      throw err;
    }
  }

  // 🟢 Update profile
  async update(name, email, userId) {
    try {
      const pool = await sql.connect(config.sqlCon);

      await pool.request()
        .input('name', sql.NVarChar, name)
        .input('email', sql.NVarChar, email)
        .input('id', sql.Int, userId)
        .query(`
          UPDATE users 
          SET name = @name, email = @email 
          WHERE id = @id
        `);

      return 'Success';

    } catch (err) {
      console.error("DB ERROR (update):", err);
      throw err;
    }
  }

  // 🟢 Update password
  async updatePassword(hashed, userId) {
    try {
      const pool = await sql.connect(config.sqlCon);

      await pool.request()
        .input('password', sql.NVarChar, hashed)
        .input('id', sql.Int, userId)
        .query(`
          UPDATE users 
          SET password = @password 
          WHERE id = @id
        `);

      return 'Success';

    } catch (err) {
      console.error("DB ERROR (updatePassword):", err);
      throw err;
    }
  }

  // 🟢 Get employees/admins
  async getEmployees() {
    try {
      const pool = await sql.connect(config.sqlCon);

      const result = await pool.request().query(`
        SELECT * FROM users 
        WHERE user_type IN ('employee', 'admin')
      `);

      return result.recordset;

    } catch (err) {
      console.error("DB ERROR (getEmployees):", err);
      throw err;
    }
  }

  // 🟢 Update employee
  async updateEmployee(user, id) {
    try {
      const pool = await sql.connect(config.sqlCon);

      await pool.request()
        .input('id', sql.Int, id)
        .input('name', sql.NVarChar, user.name)
        .input('email', sql.NVarChar, user.email)
        .input('user_type', sql.NVarChar, user.user_type)
        .query(`
          UPDATE users 
          SET name = @name, email = @email, user_type = @user_type
          WHERE id = @id
        `);

      return 'Account changes saved successfully';

    } catch (err) {
      console.error("DB ERROR (updateEmployee):", err);
      throw err;
    }
  }
};

module.exports = controller;