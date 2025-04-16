const session = require("express-session");
const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const axios = require("axios");
const path = require("path");

require("dotenv").config();

const { connectDB } = require('../config/connectmongo');
const { writeLog, getLogs } = require('../config/serverLogs');
const restoreSessionMiddleware = require("../middlewares/restoreSession");

// Short Functions
function sanitizeString(str) {
  return str.replace(/[.#$\[\]]/g, "");
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

// ==========================================================================================================

// Products Fetched From User's Cart
router.post("/products", restoreSessionMiddleware, async (req, res) => {
  const { productIds } = req.body;

  if (!Array.isArray(productIds)) return res.status(400).json({ message: "Product IDs must be an array" });

  if (productIds.length === 0) return res.status(400).json({ message: "Product IDs cannot be empty" });

  try {
    const db = await connectDB();
    const products = await db.collection("products")
      .find({ product_id: { $in: productIds } })
      .toArray();

    if (products.length === 0) return res.status(404).json({ message: "No products found" });

    res.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    writeLog('error', `Failed to fetch products: ${error}`);
    res.status(500).json({ message: "Server error" });
  }
});

// Product Id's From User Cart
router.get("/cart", restoreSessionMiddleware, async (req, res) => {
  if (!req.session.user?.email) return res.status(401).json({ message: "Unauthorized" });

  try {
    const db = await connectDB();
    const user = await db.collection("users")
      .findOne({ email: req.session.user.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ cart: user.cart || {} });
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    writeLog('error', `Failed to fetch cart: ${error}`);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/cart/items", restoreSessionMiddleware, async (req, res) => {
  if (!req.session.user || !req.session.user.email)
    return res.status(401).json({ redirect: 'auth', message: 'Unauthorized' });

  const email = req.session.user.email;

  try {
    const { productId, color } = req.body;

    if (!email || !productId) return res.status(400).json({ error: "Invalid request parameters" });

    const db = await connectDB();
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ email: email });
    const product = await db.collection("products").find({ product_id: `${productId}` }).toArray()

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.cart && user.cart[productId]) {
      return res.json({ message: "Product is already in cart", type: 'info' });
    } else {
      const cartItem = { qty: 1 };
      cartItem.color = color ?? product[0].available_colors.split(',')[0];

      if (product[0].stock) {
        await usersCollection.updateOne(
          { email: email },
          { $set: { [`cart.${productId}`]: cartItem } }
        );
      } else {
        return res.json({ message: "Out Of Stock", type: 'alert' });
      }
    }

    return res.json({ message: "Product added to your cart" });
  } catch (error) {
    console.error("Error adding to cart:", error);
    writeLog('error', `Error adding to cart: ${error}`);
    return res.status(500).json({ error: "Internal server error", type: 'error' });
  }
});

router.put("/cart/items/", restoreSessionMiddleware, async (req, res) => {
  const email = req.session.user.email;

  try {
    const { productId, action } = req.body;

    if (!email || !productId || !["increase", "decrease"].includes(action))
      return res.status(400).json({ error: "Invalid request parameters" });

    const db = await connectDB();
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ email: email });
    const product = await db.collection("products").find({ product_id: `${productId}` }).toArray()
    const productStock = product[0].stock

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (!user.cart || !user.cart[productId])
      return res.status(404).json({ message: "Product not found in cart", type: 'alert' });

    let qty = user.cart[productId].qty;
    if (action === "increase" && productStock > qty) {
      qty += 1;
    } else if (action === "increase" && productStock === qty) {
      return res.json({ message: `Only ${productStock} ${productStock > 1 ? 'items' : 'item'} left`, type: 'alert', qty });
    } else if (action === "decrease" && qty > 1) {
      qty -= 1;
    }

    await usersCollection.updateOne(
      { email: email },
      { $set: { [`cart.${productId}.qty`]: qty } }
    );
    return res.json({ message: "Cart updated successfully", qty });
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    writeLog('error', `Error updating cart quantity: ${error}`);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/cart/items/", restoreSessionMiddleware, async (req, res) => {
  if (!req.session.user || !req.session.user.email)
    return res.status(401).json({ message: "User not authenticated" });

  const email = req.session.user.email;
  const { productId } = req.body;

  if (!productId)
    return res.status(400).json({ message: "Product ID is required" });

  try {
    const db = await connectDB();
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ email: email });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (!user.cart || !user.cart[productId])
      return res.status(404).json({ message: "Product not found in cart", type: 'alert' });

    await usersCollection.updateOne(
      { email: email },
      { $unset: { [`cart.${productId}`]: "" } }
    );

    return res.json({ message: "Product removed from cart successfully!" });
  } catch (error) {
    console.error("Error removing from cart:", error);
    writeLog('error', `Error removing from cart: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

// ==========================================================================================================
