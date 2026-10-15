import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("----- MongoDB Database has been connected -----");
        
    } catch (error) {
        console.error("MongoDB Database connection failed, error:", error.message);
        process.exit(1);
    }
};

export default connectDB;