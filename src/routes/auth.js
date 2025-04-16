const cookieParser = require("cookie-parser");
const session = require("express-session");
const express = require("express");
const router = express.Router();
const axios = require("axios");

router.use(cookieParser());

require("dotenv").config();

const sendNodeMail = require('../mailer/nodemailer');
const { otpTemplate } = require('../mailer/mailtemplates');

const { writeLog, getLogs } = require('../config/serverLogs');
const { connectDB } = require('../config/connectmongo');

function generateOTP(length = 6) {
  const chars = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) otp += chars.charAt(Math.floor(Math.random() * chars.length));
  return otp;
}

function validateEmail(email) {
  const emailProviders = [
    "@gmail.com", "@yahoo.com", "@outlook.com", "@hotmail.com", "@live.com", "@msn.com", "@icloud.com", "@aol.com",
    "@mail.com", "@protonmail.com", "@zoho.com", "@gmx.com", "@yandex.com", "@tutanota.com", "@fastmail.com",
    "@inbox.com", "@rediffmail.com", "@web.de", "@seznam.cz", "@mail.ru", "@naver.com", "@qq.com", "@daum.net",
  ];

  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return (
    re.test(email) && emailProviders.some((domain) => email.endsWith(domain))
  );
}

const validatePakistaniNumber = (num) => /^(\+92|92|0)?[3][0-9]{9}$/.test(num) ? num.slice(-10).padStart(11, "0") : null;

// ============================================================================================

let otpStore = {};

// Request OTP Endpoint
router.post("/otp/request", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });
  if (!validateEmail(email))
    return res.status(400).json({ message: "Email is not Valid" });

  const otp = generateOTP();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  otpStore[email] = { otp, expiresAt, attempts: 3 };

  try {
    await sendNodeMail(email, "Your One-Time Passcode From NexaEase", otpTemplate(otp));
    console.log(`Sent OTP ${otp} to ${email}`);
    writeLog("info", `Sent OTP ${otp} to ${email}`);
    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.log(error)
    writeLog("error", `Failed to send OTP to ${email}: ${error}`);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// Verify OTP Endpoint - REGISTER
router.post("/register/verify-otp", async (req, res) => {
  var { email, otp, username, phone_number, address } = req.body;
  otp = otp.toUpperCase();

  if (!email || !otp || !username || !phone_number || !address)
    return res.status(400).json({ message: "Details are required" });

  if (!validatePakistaniNumber(phone_number))
    return res.status(400).json({ message: "Invalid Phone Number" });

  if (!validateEmail(email))
    return res.status(400).json({ message: "Invalid Email" });

  console.log(`Register - OTP ${otp} for ${email}`);
  writeLog("info", `Register - OTP ${otp} for ${email}`);

  const otpData = otpStore[email];
  if (!otpData) return res.status(400).json({ message: "OTP not requested" });

  if (Date.now() > otpData.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ message: "OTP expired" });
  }

  if (otpData.otp !== otp) {
    otpData.attempts -= 1;
    if (otpData.attempts <= 0) {
      delete otpStore[email];
      return res
        .status(403)
        .json({ message: "Too many failed attempts, request a new OTP" });
    }
    return res
      .status(400)
      .json({ message: "Incorrect OTP, attempts left: " + otpData.attempts });
  }

  try {
    const db = await connectDB();
    const usersCollection = db.collection("users");

    let user = await usersCollection.findOne({ email: email });

    if (!user) {
      user = {
        fullName: username,
        email: email,
        phoneNumber: phone_number,
        address: address,
        joinedOn: new Date().toLocaleString(),
        lastLoggedIn: new Date().toLocaleString(),
        cart: {},
      };
      await usersCollection.insertOne(user);
    } else {
      await usersCollection.updateOne(
        { email: email },
        { $set: { lastLoggedIn: new Date().toLocaleString() } }
      );
    }

    delete otpStore[email];
    req.session.user = { email };
    const sessionId = req.sessionID;
    const sessionsCollection = db.collection("sessions");
    await sessionsCollection.updateOne(
      { email: email },
      {
        $addToSet: {
          sessionIds: {
            id: sessionId,
            createdAt: new Date().toISOString(),
          },
        },
      },
      { upsert: true }
    );

    res.cookie("sessionId", sessionId, { httpOnly: true, secure: false });
    res.json({ message: "Login successful" });
  } catch (err) {
    console.error("Error during registration:", err);
    writeLog("error", `Error during registration: ${err}`);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Verify OTP Endpoint - LOGIN
router.post("/login/verify-otp", async (req, res) => {
  var { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ message: "Details are required" });

  if (!validateEmail(email))
    return res.status(400).json({ message: "Email is not Valid" });

  try {
    const db = await connectDB();
    const usersCollection = db.collection("users");
    let user = await usersCollection.findOne({ email: email });

    if (!user) {
      return res.status(404).json({
        error: "USER_NOT_FOUND",
        message: "Email is not registered",
      });
    }

    otp = otp.toUpperCase();
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    console.log(`Login - OTP ${otp} for ${email}`);
    writeLog("info", `Login - OTP ${otp} for ${email}`);

    const otpData = otpStore[email];
    if (!otpData) return res.status(400).json({ message: "OTP not requested" });

    if (Date.now() > otpData.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP expired" });
    }

    if (otpData.otp !== otp) {
      otpData.attempts -= 1;
      if (otpData.attempts <= 0) {
        delete otpStore[email];
        return res
          .status(403)
          .json({ message: "Too many failed attempts, request a new OTP" });
      }

      return res
        .status(400)
        .json({ message: "Incorrect OTP, attempts left: " + otpData.attempts });
    }

    if (!user) {
      res.status(404).json({ message: "email is not registered" });
    } else {
      await usersCollection.updateOne(
        { email: email },
        { $set: { lastLoggedIn: new Date().toLocaleString() } }
      );
    }

    delete otpStore[email];
    req.session.user = { email };

    req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;

    const sessionId = req.sessionID;
    const sessionsCollection = db.collection("sessions");
    await sessionsCollection.updateOne(
      { email: email },
      {
        $addToSet: {
          sessionIds: {
            id: sessionId,
            createdAt: new Date().toISOString(),
          },
        },
      },
      { upsert: true }
    );

    res.cookie("sessionId", sessionId, { httpOnly: true, secure: false });
    res.json({ message: "Login successful" });
  } catch (err) {
    console.error("Error during login:", err);
    writeLog("error", `Error during login: ${err}`);
    res.status(500).json({ message: "Internal server error" });
  }
});

// HOMEPAGE REQUESTS
router.post("/logout", async (req, res) => {
  try {
    const sessionId = req.cookies?.sessionId;
    if (sessionId) {
      const db = await connectDB();
      const sessionsCollection = db.collection("sessions");
      await sessionsCollection.deleteOne({ sessionId: sessionId });
    }

    res.clearCookie("sessionId", {
      httpOnly: true,
      secure: false,
    });

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        writeLog("error", `Session destruction error: ${err}`);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  } catch (error) {
    console.error("Logout error:", error);
    writeLog("error", `Logout error: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/logout-all", async (req, res) => {
  if (!req.session?.user)
    return res.status(401).json({ message: "Not logged in" });
  try {
    const db = await connectDB();
    const sessionsCollection = db.collection("sessions");
    await sessionsCollection.deleteOne({ email: req.session.user.email });
    res.clearCookie("sessionId", {
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: "strict"
    });
    req.session.destroy?.();
    return res.json({ message: "Logged out from all devices successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    writeLog("error", `Logout error: ${error}`);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
