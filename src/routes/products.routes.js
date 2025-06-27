import express from 'express';
import { upload } from "../middleware/multer.middleware.js";
import { addProduct, allProducts, commentProduct, deleteComment, deleteProduct, getComments, likeProduct, publicSingleProduct, singleProduct, updateProduct, userProducts } from '../controller/product.controller.js';
import authenticateUser from '../middleware/auth.middleware.js';

const productRouter = express.Router();

// Add authentication middleware to protect these routes
productRouter.post('/addProduct', authenticateUser, upload.single('image'), addProduct);
productRouter.get("/userProducts", authenticateUser, userProducts);
productRouter.get("/allProduct", allProducts);
productRouter.get("/singleProduct/:id",authenticateUser , singleProduct);
productRouter.get("/publicsingleProduct/:id" , publicSingleProduct);
productRouter.delete("/deleteProduct/:id",authenticateUser, deleteProduct); 
productRouter.put("/likeProduct/:id",authenticateUser, likeProduct);  
productRouter.post("/commentProduct/:id",authenticateUser, commentProduct);  
productRouter.delete("/deleteComment/:productId/:commentId",authenticateUser,deleteComment);
productRouter.get("/comments/:productId", getComments);
productRouter.put("/updateProduct/:id",authenticateUser, upload.single("image"), updateProduct);

export default productRouter;
1
