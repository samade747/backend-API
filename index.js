import express from "express";
// import cors from "cors";
import dotenv from "dotenv";
// import { rateLimit } from "express-rate-limit"
// import { connectDB } from "./config/default.js";
// import { authRoutes } from "./routes/auth.js";
// import { jobAdRoutes } from "./routes/jobAd.js";
// import "./cronJob.js"

const app = express();

dotenv.config();

const PORT = process.env.PORT || 3000;


app.use(express.json())


app.get('/', (req, res) => {
    res.send('hello samad')
})

app.listen(PORT, () => {
    console.log(`Server is Running at http://localhost:${PORT}`);
});