const { MongoClient, ObjectId } = require("mongodb");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const express = require("express");
const crypto = require("crypto");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(express.json());
app.use(cookieParser());

// ENVIRONMENT VARIABLE - SERVER DOMAIN
require("dotenv").config();

const connectDB = require('./src/config/connectmongo');

app.use(cors({ origin: `${process.env.SERVER_ADDRESS}:${process.env.PORT}`, credentials: true }));
app.use(
  session({
    secret: process.env.SECRET_COOKIE_KEY,
    resave: false, 
    saveUninitialized: true,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
  })
);

const restoreSessionMiddleware = require("./src/middlewares/restoreSession");
app.use(restoreSessionMiddleware);

// Middleware
const { stringify } = require("querystring");
const authentication = require("./src/routes/auth");
const profileRoutes = require("./src/routes/user");
const homepageRoutes = require("./src/routes/client");
const cartRoutes = require("./src/routes/cart");
const orderRoutes = require("./src/routes/order");
const aboutRoutes = require("./src/routes/about");
const querryRoutes = require("./src/routes/querry");
const mailerRoutes = require("./src/mailer/nodemailer");

// Use routes with a base path
app.use("/api", cartRoutes);
app.use("/api", profileRoutes);
app.use("/api", authentication);
app.use("/api", homepageRoutes);
app.use("/api", orderRoutes);
app.use("/api", aboutRoutes);
app.use("/api", querryRoutes);
app.use("/api/mail/send", mailerRoutes);

// SESSION RESTORE MIDDLEWARE
const verifyUser = require("./src/middlewares/VerifyUser");

// =========== BLOCK DIRECT PRIVATE FOLDER ACCESS ============
app.use("/private", (req, res) => {
  return res.status(403).send("Forbidden: Direct access to private directory is not allowed");
});

// =========== PUBLIC ================
// Pages Requests
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/public/pages", "index.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "public/public/pages", "about.html"));
});

app.get("/cart", (req, res) => {
  res.sendFile(path.join(__dirname, "public/public/pages", "cart.html"));
});

app.get("/product", (req, res) => {
  res.sendFile(path.join(__dirname, "public/public/pages", "productpage.html"));
});

// Serve PUBLIC assets (css, js, imgs)
app.use("/assets/public", express.static(path.join(__dirname, "public/public/assets")));

// =========== PRIVATE ROUTES (HTML PAGES) ============
app.get("/auth", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.sendFile(path.join(__dirname, "public/private/pages", "login.html"));
  }
});

app.get("/auth/new", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.sendFile(path.join(__dirname, "public/private/pages", "register.html"));
  }
});

app.get("/auth/edit", verifyUser, (req, res) => {
  res.sendFile(path.join(__dirname, "public/private/pages", "edit-profile.html"));
});

app.get("/me", verifyUser, (req, res) => {
  res.sendFile(path.join(__dirname, "public/private/pages", "myprofile.html"));
});

// =========== PRIVATE ASSETS (css, js, imgs) ============
app.use("/auth/assets", express.static(path.join(__dirname, "public/private/assets")));

// Serve Database Imgs
app.get("/api/images/:filename", (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, "public/private/assets/database_imgs", filename);

  const allowedOrigin = `${process.env.SERVER_ADDRESS}:${process.env.PORT}`

  const referer = req.get("Referer") || "";
  const origin = req.get("Origin") || "";

  if (!referer.startsWith(allowedOrigin) && !origin.startsWith(allowedOrigin)) {
    return res.status(403).json({ message: "Forbidden: Direct access not allowed" });
  }

  res.set("Content-Type", "image/jpeg");
  res.sendFile(imagePath, (err) => {
    if (err) {
      res.status(404).json({ message: "Image not found" });
    }
  });
});

// ----------------------------------------------------------------

// 404 Error Page
app.use((req, res) => {
  const url = req.originalUrl;
  res.set("X-Requested-URL", url);
  res.status(404).sendFile(path.join(__dirname, "public/private/pages/404.html"));
});

// Start Server
app.listen(process.env.PORT || 3000, () =>
  console.log(`Server running on ${process.env.SERVER_ADDRESS}:${process.env.PORT}`)
);


