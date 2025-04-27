import User from '../model/users.model.js'
import productModel from "../model/products.models.js";
import mongoose from "mongoose";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "../utils/cloudinary.utils.js";
  
// user post data ----->>>>>> 

const addProduct = async (req,res) =>{
    const {name,description,price,mobileNumber,category} = req.body

    const user = req.user.id

    if (!name || !description || !user || !price || !mobileNumber || !category  ) {
        return res.status(400).json({ error: "title or description or posted by required" });
      }   

try {
   // Check if the user is registered
   const postUser = await User.findById(user); // Verify user by their ID
   if (!postUser) {
     return res.status(404).json({ message: "User not found. Please register to post." });
   }
    if (!req.file) {
        return res.status(400).json({ error: "Profile image is required" });
      }
      
//    upload image on  cloudinary and response url from cloudinary
      const postImage = await uploadImageToCloudinary(req.file.buffer);
      console.log(postImage);

      const createPosts = await productModel.create({
        name,
        description,
        mobileNumber,
        postImage,
        user,
        price,
        category
      });
      res.json({
        message: "product add successfully",
        data: createPosts,
      });
    
} catch (error) {
    res.status(500).json({ error: error.message });

}
}

// get singleProduct ----->>>

const singleProduct = async (req, res) => {
  const {id} =req.params
  if (!id) {
    return res.status(400).json({ error: "Post ID required" });
  }
  try {
    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ error: "no product found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.log(error.message || error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};


// get user all products --------->>>>>>

const userProducts = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const products = await productModel.find({ user: userId });

    if (products.length === 0) {
      return res.status(200).json({ message: "No products posted by this user." });
    }

    res.status(200).json({
      message: "User products fetched successfully",
      data: products,
    });

  } catch (error) {
    console.error("❌ Error fetching user products:", error);
    res.status(500).json({ message: "Something went wrong!", error: error.message });
  }
};

// get allProduct ----->>>
const allProducts = async (req, res) => {
  // Extracting query parameters from the request
  const page = parseInt(req.query.page) || 1; // Default page 1
  const limit = parseInt(req.query.limit) || 12; // Default limit 12
  const category = req.query.category || null; // Extracting category (if any)
  const skip = (page - 1) * limit; // Skipping the products to get the current page's data

  try {
    // Prevent caching to always fetch fresh data
    res.setHeader("Cache-Control", "no-store");

    // Creating a dynamic filter object
    const filter = {}; 
    if (category) {
      filter.category = category; // Filter by category if passed
    }

    // Fetching the products with the filter, skip, and limit
    const products = await productModel.find(filter).skip(skip).limit(limit);

    // If no products are found
    if (products.length === 0) {
      return res.status(200).json({ message: "No products left!" });
    }

    // Returning the products as JSON
    res.status(200).json(products);

  } catch (error) {
    console.log(error.message || error); // Log any errors
    res.status(500).json({ message: "Something went wrong!" }); // Internal server error
  }
};


// const allProducts = async (req, res) => {
//   const page = req.query?.page || 1; // Default page is 1
//   const limit = req.query?.limit || 12; // Default limit is 10
//   const skip = (page - 1) * limit;

//   try {
//     // 🛑 Prevent caching for fresh data every time
//     res.setHeader("Cache-Control", "no-store");

//     const products = await productModel.find({}).skip(skip).limit(+limit);

//     if (products.length === 0) {
//       return res.status(200).json({ message: "No products left!" });
//     }

//     res.status(200).json(products);

//   } catch (error) {
//     console.log(error.message || error);
//     res.status(500).json({ message: "Something went wrong!" });
//   }
// };



// deleteProduct ----->>>>>

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const user = req.user.id;  // ✅ Same as updateProduct
  console.log("Request user object:", req.user);

  if (!id || !user) {
    return res.status(400).json({ error: "Post ID aur user ID required hain" });
  }

  try {
    const post = await productModel.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post nahi mila" });
    }

    // 🔐 Check if the user owns the post
    if (post.user.toString() !== user) {
      return res.status(403).json({ error: "this is not your post" });
    }

    // 📷 Delete image from Cloudinary
    await deleteImageFromCloudinary(post.postImage);

    // 🗑️ Delete from DB
    await productModel.findByIdAndDelete(id);

    res.json({ message: "Post successfully deleted" });
  } catch (error) {
    console.log("Delete Error:", error);
    res.status(500).json({ error: error.message });
  }
};


// update product  ----->>>>>> 

const updateProduct = async (req, res) => {
  try {
    const user = req.user?.id; // JWT user
    const { id: productId } = req.params;
    const { name, description, price } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid Product Id!" });
    }

    // 🔍 Find Product & Populate User
    const product = await productModel.findById(productId).populate("user");

    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }
    // 🚀 Check User Exists in Product
    if (!product.user || !product.user._id) {
      return res.status(400).json({ message: "Product user not found!" });
    }

    // 🔐 Authorization Check
    if (String(product.user._id) !== String(user)) {
      return res.status(403).json({ message: "You are not authorized to edit this product!" });
    }

    // ✅ Update Product Fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;

    await product.save();

    return res.status(200).json({
      message: "Product updated successfully!",
      product,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      message: "Something went wrong!",
      error: error.message,
    });
  }
};


  export  {addProduct,allProducts,deleteProduct,updateProduct,singleProduct,userProducts}