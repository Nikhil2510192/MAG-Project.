import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./db.js";
import userRouter from "./routes/userRoutes.js";
import postRouter from "./routes/postRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'https://69648ca4b886d29ef7631ebf--candid-daffodil-95ad2f.netlify.app',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());


// Routes
app.use('/api', userRouter);
app.use('/api', postRouter);
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});


const startServer = async () => {
    try {
        await connectDB();
        console.log('MongoDB connected');

        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Server startup error:', error.message);
        process.exit(1);
    }
};
startServer();
