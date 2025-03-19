import express from "express";
import { getAllOrders, getSingleOrder, placeOrder } from "../controller/order.controller.js";
import authenticateUser from "../middleware/auth.middleware.js";  // Import the authenticateUser middleware

const orderRouter = express.Router();

// Add authentication middleware to protect these routes
orderRouter.post("/orders", authenticateUser, placeOrder);  
orderRouter.get("/orders", authenticateUser, getAllOrders);  
orderRouter.get("/orders/:id", authenticateUser, getSingleOrder);  // Apply authentication middleware

export { orderRouter };
