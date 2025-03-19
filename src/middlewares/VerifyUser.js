const connectDB = require('../config/connectmongo');

async function verifyUser(req, res, next) {
    if (req.session.user?.email) return next();

    const sessionId = req.cookies?.sessionId;
    if (!sessionId) return res.redirect("/auth");

    try {
        const db = await connectDB();
        const sessionsCollection = db.collection("sessions");
        const sessionData = await sessionsCollection.findOne({ sessionId });

        if (!sessionData) return res.redirect("/auth");

        req.session.regenerate((err) => {
            if (err) {
                console.error("Session regeneration error:", err);
                return res.redirect("/auth");
            }

            req.session.user = { email: sessionData.email };
            res.cookie("sessionId", sessionId, {
                httpOnly: true,
                secure: false,
            });
            return next();
        });

    } catch (error) {
        console.error("Restore session middleware error:", error);
        return res.redirect("/auth");
    }
}

module.exports = verifyUser;
