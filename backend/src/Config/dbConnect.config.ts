import mongoose, { ConnectOptions } from 'mongoose';
import dotenv from 'dotenv';
import { getParameterValue } from "./awsParams.config"

dotenv.config();

async function dbConnect() {
    try {
        const dbUrl: string = await getParameterValue('DB_URL');
        
        if (!dbUrl) {
            throw new Error('Database Connection String is not defined');
        }

        await mongoose.connect(dbUrl);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Could not connect to MongoDB:', err);
    }
}

export default dbConnect;
