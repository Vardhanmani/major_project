import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import express from 'express';
import cors from "cors";
import authRouter from "./routes/authRoute.js";
import productRouter from "./routes/productRout.js";
import uploadRouter from "./routes/uploadRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "../clint/public");
const app = express();
// Middleware - CORS first
app.use(cors());
// Static assets
app.use(express.static(publicDir));
// Body parsers for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 5000;
// Inngest endpoint
app.use("/api/inngest", (req, res, next) => {
    if (!process.env.INNGEST_EVENT_KEY) {
        return res.status(500).json({
            message: "Missing INNGEST_EVENT_KEY. Set INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY in production.",
        });
    }
    if (!process.env.INNGEST_SIGNING_KEY && process.env.INNGEST_DEV !== "1") {
        return res.status(500).json({
            message: "Inngest cloud mode requires INNGEST_SIGNING_KEY. For local development, set INNGEST_DEV=1.",
        });
    }
    serve({ client: inngest, functions })(req, res, next);
});
app.get('/', (req, res) => {
    res.send('Server is Live!');
});
app.get('/favicon.png', (req, res) => {
    res.sendFile(path.join(publicDir, 'favicon.svg'));
});
app.use('/api/auth', authRouter);
app.use('/api/product', productRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/orders', orderRouter);
//Global error handling
app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ message: error.message });
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
