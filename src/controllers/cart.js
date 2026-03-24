'use strict';

// TEMP MOCK VERSION (DB DISABLED)

const controller = class CartController {

  constructor() {
    // No DB connection for now
  }

  async getContent(userId) {
    // Mock empty cart
    return { content: [] };
  }

  async addToCart(newProducts, userId) {
    try {
      // Mock success
      return 'Added to the cart!';
    } catch (err) {
      throw err;
    }
  }

  async update(updateProduct, userId) {
    try {
      // Mock success
      return 'Cart updated!';
    } catch (err) {
      throw err;
    }
  }

  async empty(userId) {
    try {
      // Mock success
      return 'Cart emptied';
    } catch (err) {
      throw err;
    }
  }
};

module.exports = controller;