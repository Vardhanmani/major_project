import "dotenv/config";
import express, { NextFunction, Request, Response } from 'express';
import cors from "cors";
import authRouter from "./routes/authRoute.js";
import productRouter from "./routes/productRout.js";
import uploadRouter from "./routes/uploadRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"

const app = express();

// Middleware - CORS first
app.use(cors());

// Inngest endpoint BEFORE body parsers (needs raw body for signature verification)
app.use("/api/inngest", serve({ client: inngest, functions }));

// Body parsers for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 5000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.use('/api/auth',authRouter);
app.use('/api/product',productRouter);
app.use('/api/upload',uploadRouter);
app.use('/api/orders',orderRouter);

//Global error handling
app.use((error : any, req: Request, res: Response , next : NextFunction)=>{
    console.error(error)
    res.status(500).json({message : error.message})
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});