import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import connectDB from './config/db.js';
import chatbotRouter from './routers/chatbot.route.js';
import profileRoutes from './routers/profile.route.js'
import healthRouter from './routers/health.route.js'
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from "./routers/auth.route.js";
import adminRoutes from "./routers/admin.route.js";
import paymentRoutes from "./routers/payment.route.js";
import passport from "./config/passport.js";
import "./utils/cron.js";

const app = express();
const port = process.env.PORT || 3000;

connectDB(); //call
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",  // frontend url//
  credentials:true
}));
app.use(cookieParser()) 
 
  
 app.use(passport.initialize());
// Defining routes
app.use('/bot/v1/', chatbotRouter);
app.use('/bot/v1/profile', profileRoutes);
app.use('/bot/v1/health', healthRouter)
app.use('/bot/v1/auth', authRoutes);
app.use('/bot/v1/admin', adminRoutes);
app.use("/bot/v1/payment", paymentRoutes);

 


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
