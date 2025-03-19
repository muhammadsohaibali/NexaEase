const cookieParser = require("cookie-parser");
const session = require("express-session");
const express = require("express");
const router = express.Router();
const axios = require("axios");

require("dotenv").config();

router.use(cookieParser());

const connectDB = require('../config/connectmongo');

// =======================================================================

router.get("/about/info", async (req, res) => {

    console.log(req.headers.origin, 'jh')

    // const email = req.session.user.email;

    try {
        // const db = await connectDB();
        // const usersCollection = db.collection("users");
        // const user = await usersCollection.findOne({ email: email });

        // if (!user || !user.fullName) {
        //     return res.status(404).json({ message: "User not found" });
        // }

        // res.json({ name: capitalizeWords(user.fullName), email: user.email, cart: user.cart });
        res.json('hi');
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
