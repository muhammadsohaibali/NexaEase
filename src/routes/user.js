const cookieParser = require("cookie-parser");
const express = require("express");
const router = express.Router();

require("dotenv").config();

router.use(cookieParser());

const { connectDB } = require('../config/connectmongo');
const { writeLog, getLogs } = require('../config/serverLogs');
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

router.get("/me/info", restoreSessionMiddleware, async (req, res) => {
    if (!req.session.user || !req.session.user.email)
        return res.status(401).json({ message: "User not authenticated" });

    const email = req.session.user.email;

    try {
        const db = await connectDB();
        const usersCollection = db.collection("users");
        const user = await usersCollection.findOne({ email: email });

        if (!user) return res.status(404).json({ message: "User not found" });
        const { _id, lastLoggedIn, ...filteredData } = user;
        res.json(filteredData);
    } catch (error) {
        console.error("Error fetching user:", error);
        writeLog("error", `Error fetching user: ${error}`);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/account/update", restoreSessionMiddleware, async (req, res) => {
    if (!req.session.user || !req.session.user.email)
        return res.status(401).json({ message: "User not authenticated", type: 'error' });

    var { phoneNumber, address, fullName } = req.body;
    const email = req.session.user.email;

    if (!phoneNumber || !address || !fullName)
        return res.status(400).json({ message: "All details are required", type: 'info' });

    if (!validateEmail(email))
        return res.status(400).json({ message: "Email is not valid", type: 'alert' });

    try {
        const db = await connectDB();
        const usersCollection = db.collection("users");
        const user = await usersCollection.findOne({ email: email });

        if (!user) {
            return res.status(404).json({
                error: "USER_NOT_FOUND",
                message: "Email is not registered",
                type: 'error'
            });
        }
        await usersCollection.updateOne(
            { email: email },
            { $set: { phoneNumber, address, fullName } }
        );
        res.json({ message: "Profile updated successfully", type: 'success' });
    } catch (error) {
        res.status(500).json({ message: "Failed to update profile", type: 'success', error });
    }
});

module.exports = router;
