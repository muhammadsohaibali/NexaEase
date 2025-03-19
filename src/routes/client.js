const cookieParser = require("cookie-parser");
const session = require("express-session");
const express = require("express");
const router = express.Router();
const axios = require("axios");

require("dotenv").config();

const sendNodeMail = require('../mailer/nodemailer');
const { contactFormTemplate } = require('../mailer/mailtemplates');
const restoreSessionMiddleware = require("../middlewares/restoreSession");

const connectDB = require('../config/connectmongo');

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

// GET PRODUCT BY ID
router.get("/product", async (req, res) => {
  try {
    const { productId } = req.query;

    if (!productId)
      return res.status(400).json({ error: "Invalid Request Parameters" });

    if (productId.length !== 6 || isNaN(Number(productId)))
      return res.status(400).json({ error: "Invalid Product ID" });

    const mongoDB = await connectDB();
    const productsCollection = mongoDB.collection("products");
    let product = await productsCollection.findOne({ p_id: productId });

    if (!product)
      return res.status(404).json({ error: "Product Not Found" });

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
        if (recentProducts.length > 10)
          recentProducts = recentProducts.slice(0, 10);
        await usersCollection.updateOne(
          { email },
          { $set: { recentProducts } },
          { upsert: true }
        );

        console.log({ message: 'Product added/updated with recent timestamp' });
      } catch (err) {
        console.error(err);
      }
    }

    const { _id, date_added, is_featured, ...filteredProduct } = product;

    return res.status(200).json(filteredProduct);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// PRODUCTS EXCLUSIVE, NEW ARRIVAL & RANDOM CATEGORY
router.get("/products/exclusive", async (req, res) => {
  try {
    const mongoDB = await connectDB();
    const productsCollection = mongoDB.collection("products");
    const products = await productsCollection.find({}).toArray();

    const exclusiveProducts = products.filter((p) =>
      [true].includes(p.is_featured)
    );

    res.json(exclusiveProducts.splice(0, 4));
  } catch (error) {
    console.error("Error fetching exclusive products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/products/fresharrivals", async (req, res) => {
  try {
    const mongoDB = await connectDB();
    const productsCollection = mongoDB.collection("products");
    const products = await productsCollection.find({}).toArray();

    const freshArrivals = products
      .sort((a, b) => b.date_added - a.date_added)
      .slice(0, 4);

    res.json(freshArrivals);
  } catch (error) {
    console.error("Error fetching fresh arrivals:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/products/category", async (req, res) => {
  try {
    const mongoDB = await connectDB();
    const productsCollection = mongoDB.collection("products");
    const products = await productsCollection.find({}).toArray();

    const categories = [...new Set(products.map((p) => p.category))];
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];

    const categoryProducts = products.filter(
      (p) => p.category === randomCategory
    );
    const modifiedProducts = categoryProducts.slice(0, 4);

    res.json({ category: randomCategory, products: modifiedProducts });
  } catch (error) {
    console.error("Error fetching category products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/products/uniqueCategory", async (req, res) => {
  try {
    const mongoDB = await connectDB();
    const productsCollection = mongoDB.collection("products");
    const products = await productsCollection.find({}).toArray();

    let uniqueCategories = [...new Set(products.map((p) => p.category))];

    res.json(uniqueCategories);
  } catch (error) {
    console.error("Error fetching unique categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/products/category/get", async (req, res) => {
  try {
    const { category } = req.query;
    const mongoDB = await connectDB();
    const productsCollection = mongoDB.collection("products");

    let query = {};
    if (category)
      query = { category };

    if (!category)
      return res.status(500).json({ error: "Invalid Parameters" });

    const categoryProducts = await productsCollection.find(query).limit(4).toArray();

    if (categoryProducts.length === 0)
      return res.status(404).json({ error: "No products found for the given category" });

    res.json({ category: category, products: categoryProducts });
  } catch (error) {
    console.error("Error fetching category products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// =========================================================================================

const validatePakistaniNumber = (num) =>
  /^(\+92|92|0)?[3][0-9]{9}$/.test(num) ? num.slice(-10).padStart(11, "0") : null;

// CONTACT FORM
router.post("/inquiries", restoreSessionMiddleware, async (req, res) => {
  try {
    const { name, number, email, message } = req.body;

    if (!validateEmail(email)) return res.status(400).json({ message: "Invalid Email!" });

    const userLoggedIn = req.session.user && req.session.user.email;
    const userEmail = userLoggedIn ? req.session.user.email : email;

    if (!message || !userEmail) return res.status(400).json({ error: "Invalid request parameters" });

    const mongoDB = await connectDB();
    const contactsCollection = mongoDB.collection("contacts");

    let validNumber = null;
    let finalName = name;

    if (userLoggedIn) {
      const usersCollection = db.collection("users");
      const user = await usersCollection.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ message: "User not found" });

      finalName = user.fullName;
      validNumber = user.phoneNumber;
    } else {
      if (!name || !number) return res.status(400).json({ error: "Invalid request parameters" });

      validNumber = validatePakistaniNumber(number);
      if (!validNumber) return res.status(400).json({ message: "Invalid Phone Number" });
    }

    const formattedDate = new Date().toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
      day: "numeric",
      month: "long",
      year: "numeric",
      hour12: false,
    });

    const inquiry = {
      message: message,
      name: finalName,
      number: validNumber,
      submittedOn: formattedDate,
      isUser: userLoggedIn ? true : false,
    };

    await contactsCollection.updateOne(
      { email: userEmail },
      {
        $push: {
          forms: {
            $each: [inquiry],
            $position: 0,
            $slice: 10,
          },
        },
      },
      { upsert: true }
    );

    try {
      await sendNodeMail(email, "NexaEase - We’ve Received Your Message!", contactFormTemplate(email, inquiry));
    } catch (error) {
      console.log(error)
    }

    return res.json({ message: "Contact Form Submitted" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
