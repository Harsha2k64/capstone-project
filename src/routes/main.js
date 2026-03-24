'use strict';

const express      = require('express');
const router       = express.Router();
const config       = require('../config/app-config.js');
const bodyParser   = require('body-parser');
const session      = require('express-session');
const passport     = require('passport');
const { check, validationResult } = require('express-validator');
const nodemailer   = require('nodemailer');

// ✅ SIMPLE SESSION (NO REDIS)
router.use(session({
  name: process.env.SESSION_NAME || 'ecommerce_session',
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(passport.initialize());
router.use(passport.session());


// Middleware
router.use(async (req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  try {
    const UsersController = require('../controllers/users.js');
    const User = new UsersController();
    res.locals.isAdmin = await User.isAdmin(req.session?.passport?.user);
  } catch {
    res.locals.isAdmin = false;
  }
  next();
});


// ================= ROUTES =================

router.get('/', (req, res) => {
  res.render(`${config.views}/public/index.ejs`);
});


router.get('/hamburguers', async (req, res) => {
  const Products = new (require('../controllers/products.js'))();

  try {
    const products = await Products.getPaginated(0);
    return res.render(`${config.views}/public/hamburguers.ejs`, { products });
  } catch {
    return res.render(`${config.views}/public/hamburguers.ejs`, { products: [] });
  }
});


router.get('/order', authenticate(), async (req, res) => {
  const Products = new (require('../controllers/products.js'))();

  try {
    const product = await Products.getProduct(req.query.p);
    return res.render(`${config.views}/public/order.ejs`, { product });
  } catch (e) {
    console.error("ORDER ERROR:", e);
    return res.redirect('/hamburguers');
  }
});


router.get('/cart', authenticate(), async (req, res) => {
  const Products = new (require('../controllers/products.js'))();
  const Cart     = new (require('../controllers/cart.js'))();

  try {
    const cartContent = await Cart.getContent(req.session.passport.user);

    const idList = Array.from(
      new Set(cartContent.content.map(({ id }) => id))
    ).toString();

    const products = JSON.parse(
      JSON.stringify(await Products.getByIdArray(idList))
    );

    return res.render(`${config.views}/public/cart.ejs`, {
      cart: cartContent.content,
      products
    });

  } catch (e) {
    console.error("CART ERROR:", e);
    return res.render(`${config.views}/public/cart.ejs`, {
      cart: [],
      products: []
    });
  }
});


router.get('/checkout', authenticate(), async (req, res) => {
  const formErrors = req.session.formErrors || false;
  req.session.formErrors = false;

  res.render(`${config.views}/public/checkoutProcess.ejs`, {
    errors: formErrors
  });
});


router.post('/checkout',
  authenticate(),
  [
    check('city').isLength({ min: 3 }),
    check('address').isLength({ min: 3 }),
    check('zip').isNumeric(),
    check('card').isNumeric(),
    check('expMonth').isLength({ min: 2, max: 2 }),
    check('expYear').isLength({ min: 2, max: 2 }),
    check('cvCode').isLength({ min: 3, max: 3 })
  ],
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.session.formErrors = errors.array();
      return res.redirect('/checkout');
    }

    const Cart     = new (require('../controllers/cart.js'))();
    const Orders   = new (require('../controllers/orders.js'))();
    const User     = new (require('../controllers/users.js'))();
    const Products = new (require('../controllers/products.js'))();

    const userId = req.session.passport.user;

    try {
      const user        = await User.getUserById(userId);
      const cartData    = await Cart.getContent(userId);
      const cartContent = cartData.content;

      const idList = Array.from(
        new Set(cartContent.map(({ id }) => id))
      ).toString();

      const allProducts = JSON.parse(
        JSON.stringify(await Products.getByIdArray(idList))
      );

      let totalAmount = 0;
      let itemsList = '';

      for (const item of cartContent) {
        const product = allProducts.find(
          p => p.id == item.id && p.size === item.size
        );

        if (product) {
          totalAmount += product.price * item.quantity;

          itemsList += `- ${product.title} (${item.size}) x${item.quantity} — ₹${(product.price * item.quantity).toFixed(2)}\n`;
        }
      }

      const transactionId = 'TXN' + Date.now();

      const orderId = await Orders.create({
        costumer_id: userId,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        card_last4: req.body.card.toString().slice(-4),
        transaction_id: transactionId,
        total_amount: totalAmount.toFixed(2),
        status: 'confirmed',
      });

      await Orders.saveOrderProducts(orderId, cartContent);
      await Cart.empty(userId);

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: 'noreply@burgersco.com',
        to: user.email,
        subject: `Order Confirmed #${orderId} — Burgers Co.`,
        text: `Hi ${user.name},

Order #${orderId} confirmed!

Items:
${itemsList}

Total: ₹${totalAmount.toFixed(2)}

Thank you!`,
      });

      return res.render(`${config.views}/public/checkout.ejs`);

    } catch (e) {
      console.error('CHECKOUT ERROR:', e);
      return res.status(500).send("Something went wrong");
    }
  }
);


router.get('/contact', (req, res) => {
  res.render(`${config.views}/public/contact.ejs`);
});


// ================= AUTH =================

function authenticate() {
  return (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
  };
}


module.exports = router;