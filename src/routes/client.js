const express = require("express");
const router = express.Router();

require("dotenv").config();

const sendNodeMail = require('../mailer/nodemailer');
const { contactFormTemplate } = require('../mailer/mailtemplates');
const restoreSessionMiddleware = require("../middlewares/restoreSession");

const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const { writeLog, getLogs } = require('../config/serverLogs');
const { connectDB, connectMongo } = require('../config/connectmongo');
const { ObjectId } = require('mongodb')

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

// =========================================================================================

router.get("/products", async (req, res) => {
  try {
    const mongoDB = await connectDB();
    const productsCollection = mongoDB.collection("products");
    const products = await productsCollection.find({}).toArray();
    const filteredProducts = products.map(({ _id, ...rest }) => rest);

    res.json(filteredProducts);

  } catch (err) {
    console.error(`Failed to fetch ${req.params.category} products:`, err);
    writeLog("error", `Failed to fetch ${req.params.category} products: ${err}`);
    res.status(500).end();
  }
});

// GET PRODUCT BY ID
router.get("/product", restoreSessionMiddleware, async (req, res) => {
  try {
    const { productId } = req.query;
    if (!productId) return res.status(400).json({ error: "Invalid Request Parameters" });
    if (productId.length !== 6 || isNaN(Number(productId))) {
      writeLog("error", `Invalid Product ID: ${productId}`);
      return res.status(400).json({ error: "Invalid Product ID" })
    };

    const mongoDB = await connectDB();
    const productsCollection = mongoDB.collection("products");
    let product = await productsCollection.findOne({ product_id: productId });

    if (!product) {
      writeLog("error", `Product not found: ${productId}`);
      return res.status(404).json({ error: "Product Not Found" });
    }

    if (req.session.user && req.session.user.email && productId) {
      try {
        const mongoDB = await connectDB();
        const usersCollection = mongoDB.collection("users");
        const email = req.session.user.email;
        const user = await usersCollection.findOne({ email }, { projection: { recentProducts: 1 } });
        let recentProducts = user?.recentProducts || [];
        const existingIndex = recentProducts.findIndex(p => p.id === productId);
        if (existingIndex !== -1) {
          recentProducts[existingIndex].addedOn = new Date();
        } else {
          recentProducts.push({
            id: productId,
            addedOn: new Date()
          });
        }
        recentProducts.sort((a, b) => new Date(b.addedOn) - new Date(a.addedOn));
        if (recentProducts.length > 4)
          recentProducts = recentProducts.slice(0, 4);
        await usersCollection.updateOne(
          { email },
          { $set: { recentProducts } },
          { upsert: true }
        );
      } catch (err) {
        console.error(err);
        writeLog("error", `Error updating recent products: ${err}`);
      }
    }
    const { _id, added_timestamp, is_featured, ...filteredProduct } = product;

    return res.status(200).json(filteredProduct);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/products/category/get", async (req, res) => {
  try {
    if (!req.query.category)
      return res.status(400).json({ error: "Category is required" });

    const mongoDB = await connectDB();
    const productsCollection = mongoDB.collection("products");

    const allCategoryProducts = await productsCollection
      .find({ category: req.query.category })
      .toArray();

    if (!allCategoryProducts.length)
      return res.status(404).json({ error: "No products found for this category" });

    const shuffledProducts = [...allCategoryProducts];
    for (let i = shuffledProducts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledProducts[i], shuffledProducts[j]] = [shuffledProducts[j], shuffledProducts[i]];
    }

    const randomProducts = shuffledProducts.slice(0, 4);

    res.json({
      category: req.query.category,
      products: randomProducts,
      totalAvailable: allCategoryProducts.length
    });
  } catch (error) {
    console.error("Error fetching category products:", error);
    writeLog("error", `Error fetching category products: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/category/:category", async (req, res) => {
  try {
    const mongoDB = await connectDB();
    const productsCollection = mongoDB.collection("products");

    const products = await productsCollection
      .find({ category: req.params.category })
      .toArray();

    const filteredProducts = products.map(({ _id, ...rest }) => rest);

    res.json(filteredProducts);

  } catch (err) {
    console.error(`Failed to fetch ${req.params.category} products:`, err);
    writeLog("error", `Failed to fetch ${req.params.category} products: ${err}`);
    res.status(500).end();
  }
});

router.get("/categories", async (req, res) => {
  try {
    const mongoDB = await connectDB();
    const productsCollection = mongoDB.collection("products");

    // Get all unique categories
    const categories = await productsCollection.distinct("category");

    res.json(categories);

  } catch (err) {
    console.error("Failed to fetch categories:", err);
    writeLog("error", `Failed to fetch categories: ${err}`);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Exclusive, New Arrival, Recents & Random Category Products
router.get("/products/sections", restoreSessionMiddleware, async (req, res) => {
  try {
    const mongoDB = await connectDB();
    const productsCollection = mongoDB.collection("products");
    const usersCollection = mongoDB.collection("users");

    const products = await productsCollection.find({}).toArray();

    const exclusive = products.filter(p => p.is_featured).sort(() => Math.random() - 0.5).slice(0, 4);
    const freshArrivals = [...products].sort((a, b) => b.added_timestamp - a.added_timestamp)
      .sort(() => Math.random() - 0.5).slice(0, 4);

    const categories = [...new Set(products.map(p => p.category))];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const categoryProducts = products.filter(p => p.category === randomCategory)
      .sort(() => Math.random() - 0.5).slice(0, 4);

    let recent = [];
    if (req.session.user?.email) {
      const user = await usersCollection.findOne(
        { email: req.session.user.email },
        { projection: { recentProducts: 1 } }
      );

      if (user?.recentProducts?.length) {
        const productIds = user.recentProducts
          .sort((a, b) => new Date(b.addedOn) - new Date(a.addedOn))
          .map(p => p.id);

        recent = products.filter(p => productIds.includes(p.product_id)).sort(() => Math.random() - 0.5);
      }
    }

    res.json({ exclusive, freshArrivals, randomCategory: { name: randomCategory, products: categoryProducts }, recent });
  } catch (error) {
    console.error("Error fetching products sections:", error);
    writeLog("error", `Error fetching products sections: ${error}`);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
});

// =========================================================================================

const validatePakistaniNumber = (num) =>
  /^(\+92|92|0)?[3][0-9]{9}$/.test(num) ? num.slice(-10).padStart(11, "0") : null;

const contactFormLimiter = rateLimit({
  windowMs: 20 * 1000,
  max: 1,
  handler: (req, res) => {
    return res.status(429).json({
      message: "Too many submissions, please try again later",
      type: "error",
      retryAfter: req.rateLimit.resetTime
    });
  },
  skip: (req) => {
    return req.session.user?.isAdmin;
  }
});

// Validation middleware
const validateInquiry = [
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('email').if(body('email').exists()).isEmail().withMessage('Invalid email'),
  body('number').if(body('number').exists()).custom(validatePakistaniNumber)
    .withMessage('Invalid Pakistani phone number'),
];

router.post("/inquiries", restoreSessionMiddleware, contactFormLimiter, validateInquiry, async (req, res) => {
  try {
    const { name, number, email, message } = req.body;
    const userLoggedIn = req.session.user && req.session.user.email;
    const userEmail = userLoggedIn ? req.session.user.email : email;

    // Additional checks for non-logged in users
    if (!userLoggedIn && (!name || !number)) {
      return res.status(400).json({
        message: "Name and phone number are required for guest submissions",
        type: "alert"
      });
    }

    const { db: mongoDB, client } = await connectMongo();
    const [user] = await Promise.all([
      mongoDB.collection("users").findOne({ email: userEmail }),
    ]);

    const inquiry = {
      message: message.trim(),
      submittedOn: new Date()
    };

    await mongoDB.collection("contacts").updateOne(
      { email: userEmail },
      {
        $setOnInsert: {
          name: user?.fullName || name,
          number: user?.phoneNumber || number,
          isUser: !!user,
          email: userEmail,
          createdAt: new Date()
        },
        $push: {
          forms: {
            $each: [inquiry],
            $position: 0,
            $slice: 10,
          }
        },
        $set: { updatedAt: new Date() }
      }
    );

    if (email) {
      try {
        await sendNodeMail(
          email,
          "NexaEase - We've Received Your Message!",
          contactFormTemplate(email, message, user?.fullName || name)
        );
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        writeLog("error", `Email sending failed: ${emailError}`);
      }
    }

    return res.json({
      success: true,
      message: "Contact form submitted successfully",
      type: 'success'
    });

  } catch (error) {
    console.error("Contact form submission error:", error);
    writeLog("error", `Contact form submission error: ${error}`);

    return res.status(500).json({
      message: "An error occurred while processing your request",
      type: 'error'
    });
  }
}
);

module.exports = router;
