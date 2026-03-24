const config = require('../config/app-config.js');
const mysql = require('mysql2');

const controller = class OrdersController {
    constructor() {
        this.con = mysql.createConnection(config.sqlCon);
    }

    create(orderData) {
        return new Promise((resolve, reject) => {
            this.con.query('INSERT INTO orders SET ?', orderData, function (err, result) {
                if (err) reject(new Error('Database connection error'));
                resolve(result.insertId);
            });
        });
    }

    saveOrderProducts(orderId, cartContent) {
        for (let i = 0; i < cartContent.length; i++) {
            const format = ({ id, quantity, size }) => [orderId, parseInt(id), quantity, size];
            cartContent[i] = format(cartContent[i]);
        }

        return new Promise((resolve, reject) => {
            this.con.query('INSERT INTO orders_items VALUES ?', [cartContent], function (err, result) {
                if (err) reject(new Error(err));
                resolve(result);
            });
        });
    }

    getOrderWithItems(orderId) {
        return new Promise((resolve, reject) => {
            this.con.query(`
                SELECT o.*, 
                       p.title as product_name, 
                       oi.quantity, 
                       oi.size,
                       s.price
                FROM orders o
                JOIN orders_items oi ON o.id = oi.order_id
                JOIN products p ON oi.item_id = p.id
                JOIN sizes s ON s.product_id = p.id AND s.size = oi.size
                WHERE o.id = ?
            `, [orderId], function (err, result) {
                if (err) reject(new Error(err));
                resolve(result);
            });
        });
    }

    getAllOrders() {
        return new Promise((resolve, reject) => {
            this.con.query(`
                SELECT o.*, u.name as customer_name, u.email as customer_email
                FROM orders o
                JOIN users u ON o.costumer_id = u.id
                ORDER BY o.created_at DESC
            `, function (err, result) {
                if (err) reject(new Error(err));
                resolve(result);
            });
        });
    }
}

module.exports = controller;