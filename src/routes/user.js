const cookieParser = require("cookie-parser");
const session = require("express-session");
const express = require("express");
const router = express.Router();
const axios = require("axios");

require("dotenv").config();

router.use(cookieParser());

const connectDB = require('../config/connectmongo');
const restoreSessionMiddleware = require("../middlewares/restoreSession");

// =======================================================================
// Short Functions

function validateEmail(email) {
    const emailProviders = [
        "@gmail.com", "@yahoo.com", "@outlook.com", "@hotmail.com", "@live.com", "@msn.com",
        "@icloud.com", "@aol.com", "@mail.com", "@protonmail.com", "@zoho.com", "@gmx.com",
        "@yandex.com", "@tutanota.com", "@fastmail.com", "@inbox.com", "@rediffmail.com",
        "@web.de", "@seznam.cz", "@mail.ru", "@naver.com", "@qq.com", "@daum.net",
    ];

    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return (
        re.test(email) && emailProviders.some((domain) => email.endsWith(domain))
    );
}

function capitalizeWords(str) {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

// =======================================================================

router.get("/myinfo", restoreSessionMiddleware, async (req, res) => {
    if (!req.session.user || !req.session.user.email)
        return res.status(401).json({ message: "User not authenticated" });

    const email = req.session.user.email;

    try {
        const db = await connectDB();
        const usersCollection = db.collection("users");
        const user = await usersCollection.findOne({ email: email });

        if (!user || !user.fullName) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ name: capitalizeWords(user.fullName), email: user.email, cart: user.cart });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// EDIT PROFILE REQUESTS
router.get("/me/profile", restoreSessionMiddleware, async (req, res) => {
    if (!req.session.user || !req.session.user.email)
        return res.status(401).json({ message: "User not authenticated" });

    const email = req.session.user.email;

    try {
        const db = await connectDB();
        const usersCollection = db.collection("users");
        const user = await usersCollection.findOne({ email: email });

        if (!user || !user.fullName) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            name: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            address: user.address,
            joinedon: user.joinedOn
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/account/update", restoreSessionMiddleware, async (req, res) => {
    if (!req.session.user || !req.session.user.email)
        return res.status(401).json({ message: "User not authenticated" });

    var { phoneNumber, address, fullName } = req.body;
    const email = req.session.user.email;

    if (!phoneNumber || !address || !fullName)
        return res.status(400).json({ message: "All details are required" });

    if (!validateEmail(email))
        return res.status(400).json({ message: "Email is not valid" });

    try {
        const db = await connectDB();
        const usersCollection = db.collection("users");
        const user = await usersCollection.findOne({ email: email });

        if (!user) {
            return res.status(404).json({
                error: "USER_NOT_FOUND",
                message: "Email is not registered",
            });
        }

        await usersCollection.updateOne(
            { email: email },
            { $set: { phoneNumber, address, fullName } }
        );

        res.json({ message: "Profile updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to update profile", error });
    }
});

// router.get("/session/restore", async (req, res) => {
//     try {
//         const sessionId = req.cookies?.sessionId;

//         if (!sessionId) {
//             return res.status(401).json({ message: "No session found" });
//         }

//         const db = await connectDB();
//         const sessionsCollection = db.collection("sessions");
//         const sessionData = await sessionsCollection.findOne({
//             sessionId: sessionId,
//         });

//         if (!sessionData) {
//             return res.status(401).json({ message: "Session expired or not found" });
//         }

//         req.session.regenerate((err) => {
//             if (err) {
//                 console.error("Session regeneration error:", err);
//                 return res.status(500).json({ message: "Session restoration failed" });
//             }

//             req.session.user = { email: sessionData.email };
//             res.cookie("sessionId", sessionId, {
//                 httpOnly: true,
//                 secure: false,
//             });

//             console.log({ message: "Session restored", user: req.session.user });

//             res.json({ message: "Session restored", user: req.session.user });
//         });
//     } catch (error) {
//         console.error("Restore session error:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });


module.exports = router;
