import express from "express";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";
import { createOrder, getAllOrders, getOrder, getOrderLocation, getUserOrder, updateOrderStatus, } from "../controllers/orderController.js";
const orderRouter = express.Router();
// Create a new order
orderRouter.post("/", auth, createOrder);
// Get logged-in user's orders
orderRouter.get("/", auth, getUserOrder);
// Get all orders (Admin)
orderRouter.get("/all", auth, admin, getAllOrders);
// Get a single order
orderRouter.get("/:id", auth, getOrder);
// Update order status (Admin)
orderRouter.put("/:id/status", auth, admin, updateOrderStatus);
// Get live order location
orderRouter.get("/:id/location", auth, getOrderLocation);
export default orderRouter;
