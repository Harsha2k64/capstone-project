'use strict';

const express      = require('express');
const router       = express.Router();
require('dotenv').config();

const config       = require('../config/app-config.js');
const bcrypt       = require('bcrypt');
const session      = require('express-session');
const flash        = require('express-flash');
const passport     = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const cookieParser = require('cookie-parser');
const csurf        = require('csurf');
const bodyParser   = require('body-parser');
const nodemailer   = require('nodemailer');

const UsersController = require('../controllers/users.js');
const User = new UsersController();


// ✅ SIMPLE SESSION (NO REDIS)
router.use(session({
  name: process.env.SESSION_NAME || 'ecommerce_session',
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // keep false for now
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

router.use(passport.initialize());
router.use(passport.session());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(cookieParser());
router.use(csurf({ cookie: true }));
router.use(flash());


// Middleware
router.use(async (req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  try {
    res.locals.isAdmin = await User.isAdmin(req.session?.passport?.user);
  } catch {
    res.locals.isAdmin = false;
  }
  next();
});


// ================= PASSPORT =================

passport.use('local', new LocalStrategy(async (email, password, done) => {
  try {
    const user = await User.getUserByEmail(email);

    if (!user) {
      return done(null, false, { message: 'No user with that email' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return done(null, false, { message: 'Password incorrect' });
    }

    return done(null, user);

  } catch (err) {
    console.error('Passport error:', err);
    return done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.getUserById(id);
    if (!user) return done(null, false);
    done(null, user);
  } catch (e) {
    done(e);
  }
});


// ================= ROUTES =================

router.get('/', notAuthenticated(), (req, res) => {
  res.render(`${config.views}/public/login.ejs`, { csrfToken: req.csrfToken() });
});

router.post('/', passport.authenticate('local', {
  successRedirect: '/hamburguers',
  failureRedirect: '/login',
  failureFlash: true,
}));

router.get('/logout', (req, res) => {
  req.logout(() => {});
  req.session.destroy();
  res.redirect('/login');
});

router.get('/register', (req, res) => {
  res.render(`${config.views}/public/register.ejs`, { csrfToken: req.csrfToken() });
});

router.post('/register', async (req, res) => {
  if (!req.session.otpVerified) return res.redirect('/login/register');

  try {
    const hashed = await bcrypt.hash(req.body.password, 10);

    await User.save({
      name: req.body.name,
      email: req.body.username,
      password: hashed,
    });

    req.session.otpVerified = null;

    res.redirect('/login');

  } catch (e) {
    console.error('Register error:', e);
    res.redirect('/login/register');
  }
});

router.get('/profile', async (req, res) => {
  try {
    const user = await User.getUserById(req.session?.passport?.user);
    if (!user) return res.redirect('/login');

    res.render(`${config.views}/public/profile.ejs`, {
      user,
      msg: req.query.success,
      csrfToken: req.csrfToken(),
    });

  } catch (e) {
    console.error('Profile error:', e);
    res.redirect('/login');
  }
});

router.post('/profile', async (req, res) => {
  const userId = req.session?.passport?.user;

  try {
    await User.update(req.body.name, req.body.email, userId);

    if (req.body.password) {
      const hashed = await bcrypt.hash(req.body.password, 10);
      await User.updatePassword(hashed, userId);
    }

    res.redirect('/login/profile?success=true');

  } catch (e) {
    console.error('Profile update error:', e);
    res.redirect('/login/profile?success=false');
  }
});

router.get('/reset', (req, res) => {
  res.render(`${config.views}/public/reset.ejs`, {
    msg: req.query.success,
    csrfToken: req.csrfToken(),
  });
});

router.post('/reset', async (req, res) => {
  try {
    const user = await User.getUserByEmail(req.body.email);
    if (!user) return res.redirect('/login/reset?success=false');

    const randomPass = Math.random().toString(36).slice(-8);
    const hashed = await bcrypt.hash(randomPass, 10);

    await User.updatePassword(hashed, user.id);

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Burgers Co." <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset — Burgers Co.',
      text: `Hi ${user.name}, your new temporary password is: ${randomPass}`,
    });

    res.redirect('/login/reset?success=true');

  } catch (e) {
    console.error('Reset error:', e);
    res.redirect('/login/reset?success=false');
  }
});


// ================= HELPERS =================

function notAuthenticated() {
  return (req, res, next) => {
    if (!req.isAuthenticated()) return next();
    res.redirect('/hamburguers');
  };
}

module.exports = router;