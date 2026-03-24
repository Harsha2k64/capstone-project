'use strict';

const nodemailer = require('nodemailer');

const OTP_TTL = 300; // 5 minutes

// ⚠️ In-memory (temporary — will improve later with Redis)
const otpStore = {};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function storeOTP(email, otp) {
  otpStore[email] = {
    otp,
    expiresAt: Date.now() + OTP_TTL * 1000
  };

  setTimeout(() => {
    delete otpStore[email];
  }, OTP_TTL * 1000);
}

// ✅ Reusable transporter (better performance)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ==============================
// SEND OTP
// ==============================
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({ success: false, message: 'Email is required' });
    }

    const otp = generateOTP();
    storeOTP(email, otp);

    await transporter.sendMail({
      from: `"Burgers Co." <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Verification Code',
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:24px;
                    border:1px solid #e5e7eb;border-radius:8px">
          <h2>Verification code</h2>
          <p>This code expires in 5 minutes.</p>
          <div style="font-size:32px;font-weight:bold;letter-spacing:6px;">
            ${otp}
          </div>
        </div>`
    });

    return res.json({ success: true, message: 'OTP sent' });

  } catch (e) {
    console.error('EMAIL ERROR:', e);
    return res.json({ success: false, message: 'Failed to send email' });
  }
};

// ==============================
// VERIFY OTP
// ==============================
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.json({ success: false, message: 'Email and OTP required' });
    }

    const record = otpStore[email];

    if (!record) {
      return res.json({
        success: false,
        message: 'OTP expired. Request new one.'
      });
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[email];
      return res.json({
        success: false,
        message: 'OTP expired.'
      });
    }

    if (record.otp !== otp) {
      return res.json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    delete otpStore[email];

    req.session.otpVerified = true;
    req.session.otpEmail = email;

    return res.json({ success: true, message: 'OTP Verified' });

  } catch (err) {
    console.error('VERIFY OTP ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};