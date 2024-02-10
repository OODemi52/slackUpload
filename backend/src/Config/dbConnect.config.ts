import mongoose, { ConnectOptions } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function dbConnect() {
    try {
        await mongoose.connect(
            process.env.DB_URL as string,
            {} as ConnectOptions
        );
        console.log("Successfully connected to MongoDB Atlas!");
    } catch (error) {
        console.error("Error connecting to MongoDB Atlas:", error);
    }
}

export default dbConnect;
