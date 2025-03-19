const session = require("express-session");
const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const axios = require("axios");
const path = require("path");

require("dotenv").config();

const connectDB = require('../config/connectmongo');

// Short Functions
function sanitizeString(str) {
    return str.replace(/[.#$\[\]]/g, "");
}

function capitalizeWords(str) {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

// ==========================================================================================================

router.get("/search", async (req, res) => {
    try {
        const searchQuery = req.query.q || "";
        if (!searchQuery) return res.status(400).json({ error: "Search query required" });

        const db = await connectDB();
        const collection = db.collection("products");

        // Use MongoDB `$regex` for lightweight search
        const results = await collection.find({
            p_name: { $regex: searchQuery, $options: "i" }
        }).toArray();
        res.json(results);
    } catch (err) {
        console.error("Search Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// ==========================================================================================================

module.exports = router;
