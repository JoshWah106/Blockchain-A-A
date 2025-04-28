require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

// In-memory OTP store
const otps = {}; // { [email]: { code, expiresAt } }

// configure Mailtrap transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
}

async function sendOTP(email, otp) {
  // send via Mailtrap SMTP
  const info = await transporter.sendMail({
    from: '"EtherLogin" <no-reply@example.com>',
    to: email,
    subject: "Your OTP Code",
    text: `Your verification code is: ${otp}`,
  });
  console.log("Mailtrap envelope:", info.envelope);
}

// Signature verification   
app.post("/verify", (req, res) => {
  const { address, signature, nonce } = req.body;
  try {
    const recovered = ethers.utils.verifyMessage(nonce, signature);
    res.json({ success: recovered.toLowerCase() === address.toLowerCase() });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Request OTP
app.post("/request-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: "Missing email" });
  }
  const otp = generateOTP();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5min
  otps[email.toLowerCase()] = { code: otp, expiresAt };

  try {
    await sendOTP(email, otp);
    res.json({ success: true, message: "OTP sent (check Mailtrap inbox)" });
  } catch (err) {
    console.error("OTP send error:", err);
    res.status(500).json({ success: false, error: "Failed to send OTP" });
  }
});

// Verify OTP
app.post("/verify-otp", (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ success: false, error: "Missing parameters" });
  }

  const record = otps[email.toLowerCase()];
  if (!record) {
    return res.status(400).json({ success: false, error: "No OTP requested" });
  }

  if (Date.now() > record.expiresAt) {
    delete otps[email.toLowerCase()];
    return res.status(400).json({ success: false, error: "OTP expired" });
  }

  if (record.code === code) {
    delete otps[email.toLowerCase()];
    return res.json({ success: true });
  } else {
    return res.status(400).json({ success: false, error: "Incorrect OTP" });
  }
});

app.listen(3001, () => console.log("Backend running on http://localhost:3001"));
