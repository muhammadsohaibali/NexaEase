const connectDB = require('../config/connectmongo');

async function restoreSessionMiddleware(req, res, next) {
    console.log("Session before restoration:", req.session?.user);

    if (req.session?.user) {
        console.log("Session found in req.session:", req.session.user);
        return next();
    }
    
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) {
        console.log("No sessionId found in cookies");
        return next();
    }

    try {
        const db = await connectDB();
        const sessionsCollection = db.collection("sessions");

        console.log(`Trying to restore session with sessionId: ${sessionId}`);

        const sessionData = await sessionsCollection.findOne({
            "sessionIds.id": sessionId
        });

        if (!sessionData) {
            console.log("No session data found in DB for sessionId:", sessionId);
            return next();
        }

        console.log("Session data found:", sessionData);

        req.session.user = { email: sessionData.email };

        // Log the restored session details
        console.log("Restored session with email:", sessionData.email);

        res.cookie("sessionId", sessionId, {
            httpOnly: true,
            secure: false,
        });

        return next();
    } catch (error) {
        console.error("Restore session middleware error:", error);
        return next();
    }
}

module.exports = restoreSessionMiddleware;
