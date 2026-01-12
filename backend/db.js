import mongoose from "mongoose";

const connectDB = () => {
    mongoose
        .connect(process.env.MONGODB_URL,)
        .then((connectionInstance) => {
            console.log(`MongoDB is connected! DB Host: ${connectionInstance.connection.host}`);
        })
        .catch((error) => {
            console.log("ERROR:", error);
            process.exit(1);
        });
};

export default connectDB;