const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        return client.db("NexaEaseDB");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err;
    }
}

module.exports = connectDB;
