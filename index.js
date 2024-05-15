import express from "express";
import cors from "cors"
import dotenv from "dotenv"
import { rateLimit } from "express-rate-limit"
import { connectDB } from "./config/default.js";
import { authRoutes } from "./routes/auth.js";
import { jobAdRoutes } from "./routes/jobAd.js";
import "./cronJob.js"

const app = express();

dotenv.config();

app.use(express.json())