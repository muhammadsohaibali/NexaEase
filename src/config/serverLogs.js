// serverLogs.js
const { connectDB } = require('./connectmongo');

async function writeLog(type, logMessage) {
    const db = await connectDB();
    const logsCollection = db.collection("server_logs");

    const timestamp = (new Date()).toString().split('G')[0].trim();

    const logEntry = {
        type: type,
        timestamp: timestamp,
        message: logMessage
    };

    await logsCollection.insertOne(logEntry);
}

async function getLogs(filter = {}) {
    const db = await connectDB();
    const logsCollection = db.collection("server_logs");
    return await logsCollection.find(filter).toArray();
}

module.exports = { writeLog, getLogs };
