'use strict';

const nodemailer = require('nodemailer');

const OTP_TTL = 300; // 5 minutes

// Simple in-memory store
const otpStore = {};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Auto cleanup function
function storeOTP(email, otp) {
  otpStore[email] = {
    otp,
    expiresAt: Date.now() + OTP_TTL * 1000
  };

  // Auto delete after expiry
  setTimeout(() => {
    delete otpStore[email];
  }, OTP_TTL * 1000);
}

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({ success: false, message: 'Email is required' });
    }

    const otp = generateOTP();

    // Store OTP
    storeOTP(email, otp);

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Burgers Co." <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Burgers Co. Verification Code',
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:24px;
                    border:1px solid #e5e7eb;border-radius:8px">
          <h2 style="color:#1f2937">Verification code</h2>
          <p style="color:#6b7280">
            Enter this code to complete your registration.
            It expires in 5 minutes.
          </p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:8px;
                      color:#111827;margin:24px 0">${otp}</div>
          <p style="color:#9ca3af;font-size:12px">
            If you did not request this, ignore this email.
          </p>
        </div>`
    });

    return res.json({ success: true, message: 'OTP sent to your email' });

  } catch (e) {
    console.error('Email error:', e.message);
    return res.json({ success: false, message: 'Failed to send email' });
  }
};

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
        message: 'OTP expired. Please request a new one.'
      });
    }

    // Check expiry
    if (Date.now() > record.expiresAt) {
      delete otpStore[email];
      return res.json({
        success: false,
        message: 'OTP expired. Please request a new one.'
      });
    }

    // Check OTP match
    if (record.otp !== otp) {
      return res.json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    // Success → delete OTP
    delete otpStore[email];

    req.session.otpVerified = true;
    req.session.otpEmail = email;

    return res.json({ success: true, message: 'OTP Verified' });

  } catch (err) {
    console.error('VERIFY OTP ERROR:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};