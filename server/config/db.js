// MongoDB connection configuration
// Uses mongoose to connect to a local or cloud MongoDB instance

const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(
            process.env.MONGO_URI || "mongodb://localhost:27017/productivity_dashboard",
            { serverSelectionTimeoutMS: 15000 }
        );
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        console.warn("Continuing with in-memory API fallback. Start MongoDB for persistent data.");
    }
};

module.exports = connectDB;
