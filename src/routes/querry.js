// ==========================================================================================================

const express = require("express");
const router = express.Router();

require("dotenv").config();

const { connectDB } = require('../config/connectmongo');
const { writeLog, getLogs } = require('../config/serverLogs');

// ==========================================================================================================


router.get("/search", async (req, res) => {
    try {
        const searchQuery = req.query.q || "";
        if (!searchQuery) return res.status(400).json({ error: "Search query required" });

        const db = await connectDB();
        const collection = db.collection("products");

        const regexQuery = new RegExp(searchQuery, "i");

        // Search only by product_name with projection to only return needed fields
        const results = await collection.find({
            product_name: { $regex: regexQuery }
        }, {
            projection: {
                _id: 0,
                product_id: 1,
                product_name: 1,
                category: 1,
                discounted_price: 1,
                imgs: { $slice: 1 } // Only return first image
            }
        }).limit(45).toArray(); // Increased limit since you mentioned 45 products

        // Get all unique categories from the matching products
        const categoryMap = new Map();
        results.forEach(item => {
            if (!categoryMap.has(item.category)) {
                categoryMap.set(item.category, {
                    category_id: item.category.toLowerCase().replace(/\s+/g, '-'),
                    name: item.category,
                    product_count: 0
                });
            }
            categoryMap.get(item.category).product_count++;
        });

        // Prepare the response
        const response = {
            products: results,
            categories: Array.from(categoryMap.values())
        };

        res.json(response);
    } catch (err) {
        console.error("Search Error:", err);
        writeLog("error", `Search Error: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ==========================================================================================================

module.exports = router;
