const { connectDB } = require('../config/connectmongo');

async function restoreSessionMiddleware(req, res, next) {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) return next();
    try {
        const db = await connectDB();
        const usersCollection = db.collection("sessions");
        const userSession = await usersCollection.findOne({ "sessionIds.id": sessionId });
        if (!userSession) {
            res.clearCookie("sessionId");
            req.session.destroy?.();
            return next();
        }
        req.session = req.session || {};
        req.session.user = { email: userSession.email };
        res.cookie("sessionId", sessionId, {
            httpOnly: true,
            secure: false,             // Set true in production with HTTPS
            sameSite: "strict"
        });
        return next();
    } catch (error) {
        console.error("❌ Session restore error:", error);
        return next();
    }
}

module.exports = restoreSessionMiddleware;

