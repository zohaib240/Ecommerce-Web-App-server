import express from 'express';
import { registerUser, loginUser, logoutUser, refreshToken, getAllUsers } from '../controller/users.controller.js';
import { upload } from "../middleware/multer.middleware.js";
import authenticateUser from "../middleware/auth.middleware.js"; // Token verification middleware

const router = express.Router();

// Public routes
router.post('/auth/login', loginUser); 
router.post('/auth/logout', authenticateUser, logoutUser); 
router.post('/refreshToken', refreshToken); 

// Admin-Only route to get all users (secured route)
router.get('/getAllUsers', authenticateUser, getAllUsers); 

// Register route with image upload
router.post('/auth/register', upload.single('image'), registerUser); 

export default router;




