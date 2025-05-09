// routes/cart.routes.js
import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
  checkout,
} from "../controller/cart.controller.js";
import authenticateUser from "../middleware/auth.middleware.js";

const cartRouter = express.Router();

// ✅ Add item to cart
cartRouter.post("/add", authenticateUser, addToCart);

// ✅ Get user's cart
cartRouter.get("/", authenticateUser, getCart);

// ✅ Remove item from cart
cartRouter.post("/remove", authenticateUser, removeFromCart);

// ✅ Update item quantity
cartRouter.post("/update-quantity", authenticateUser, updateCartQuantity);

// ✅ Checkout
cartRouter.post("/checkout", authenticateUser, checkout);

export {cartRouter};
