'use strict';

// express initialization
const express = require("express");
const router = express.Router();
const config = require('../config/app-config.js');

// required libraries
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');

// ✅ SESSION (NO REDIS)
router.use(session({
  name: process.env.SESSION_NAME || 'ecommerce_session',
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
}));

// body parsers
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// passport
router.use(passport.initialize());
router.use(passport.session());


// ==============================
// ROUTES
// ==============================

// Check if there's stock
router.get("/checkStock", async (req, res) => {
  const ProductsController = require('../controllers/products.js');
  const Products = new ProductsController();

  try {
    return res.send({ stock: 10 });
  } catch (e) {
    console.error("CHECK STOCK ERROR:", e);
    return res.status(500).send(false);
  }
});


// Add products to cart
router.post("/addToCart", async (req, res) => {
  const CartController = require('../controllers/cart.js');
  const Cart = new CartController();

  try {
    const user = req.session.passport?.user;
    const response = await Cart.addToCart(req.body.addToCart, user);
    return res.send(response);
  } catch (e) {
    console.error("ADD TO CART ERROR:", e);
    return res.status(500).send({ success: false });
  }
});


// Load paginated products
router.get("/loadPage", async (req, res) => {
  const ProductsController = require('../controllers/products.js');
  const Products = new ProductsController();

  try {
    const products = await Products.getPaginated(req.query.page);
    return res.render(`${config.views}/templates/productsList.ejs`, { products });
  } catch (e) {
    console.error("LOAD PAGE ERROR:", e);
    return res.render(`${config.views}/templates/productsList.ejs`, { products: false });
  }
});


// Modify products in cart
router.post("/updateCart", async (req, res) => {
  const CartController = require('../controllers/cart.js');
  const Cart = new CartController();

  try {
    const user = req.session.passport?.user;
    const response = await Cart.update(req.body.updateProduct, user);
    return res.send(response);
  } catch (e) {
    console.error("UPDATE CART ERROR:", e);
    return res.status(500).send({ success: false });
  }
});


// ==============================
// OTP ROUTES
// ==============================

const otpController = require('../controllers/otpController');

router.post("/sendOTP", otpController.sendOTP);
router.post("/verifyOTP", otpController.verifyOTP);


// ==============================

module.exports = router;