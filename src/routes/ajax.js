'use strict';

const express = require("express");
const router = express.Router();
const config = require('../config/app-config.js');

const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');

// ✅ SESSION
router.use(session({
  name: process.env.SESSION_NAME || 'ecommerce_session',
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
}));

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.use(passport.initialize());
router.use(passport.session());


// ==============================
// ROUTES
// ==============================

// ✅ FIXED: REAL DB CALL
router.get("/checkStock", async (req, res) => {
  const ProductsController = require('../controllers/products.js');
  const Products = new ProductsController();

  try {
    const stock = await Products.checkStock(req.query.id, req.query.size);
    return res.send(stock);
  } catch (e) {
    console.error("CHECK STOCK ERROR:", e);
    return res.status(500).send({ stock: 0 });
  }
});


// Add products to cart
router.post("/addToCart", async (req, res) => {
  const CartController = require('../controllers/cart.js');
  const Cart = new CartController();

  try {
    const user = req.session.passport?.user;

    if (!user) {
      return res.status(401).send({ success: false, message: "Login required" });
    }

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

    if (!user) {
      return res.status(401).send({ success: false, message: "Login required" });
    }

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