import User from '../model/users.model.js'
import productModel from "../model/products.models.js";
import mongoose from "mongoose";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "../utils/cloudinary.utils.js";
  
// user post data ----->>>>>> 


const addProduct = async (req, res) => {
  console.log("req.body:", req.body); // 👈 debugging

  const {
    name,
    description,
    price,
    mobileNumber,
    category,
    location,        // 👈 location destructure
  } = req.body;

  const user = req.user.id;

  // 🛑 Required fields check (including location)
  if (
    !name ||
    !description ||
    !user ||
    !price ||
    !mobileNumber ||
    !category ||
    !location      // 👈 location validation
  ) {
    return res
      .status(400)
      .json({ error: "All fields including location are required" });
  }

  try {
    // Verify user by their ID
    const postUser = await User.findById(user);
    if (!postUser) {
      return res
        .status(404)
        .json({ message: "User not found. Please register to post." });
    }

    // Image file check
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "Product image is required" });
    }

    // Upload image to Cloudinary
    const postImage = await uploadImageToCloudinary(req.file.buffer);
    console.log("Cloudinary URL:", postImage);

    // Create product with location
    const createPosts = await productModel.create({
      name,
      description,
      mobileNumber,
      postImage,
      user,
      price,
      category,
      location,     // 👈 save location
    });

    console.log("Saved Product:", createPosts);
    res.status(201).json({
      message: "Product added successfully",
      data: createPosts,
    });
  } catch (error) {
    console.error("Error in addProduct:", error);
    res.status(500).json({ error: error.message });
  }
};


// const addProduct = async (req,res) =>{
//   console.log("req.body:", req.body); // 👈 yeh line daalni hai
//     const {name,description,price,mobileNumber,category} = req.body

//     const user = req.user.id

//     if (!name || !description || !user || !price || !mobileNumber || !category  ) {
//         return res.status(400).json({ error: "title or description or posted by required" });
//       }   

// try {
//    // Check if the user is registered
//    const postUser = await User.findById(user); // Verify user by their ID
//    if (!postUser) {
//      return res.status(404).json({ message: "User not found. Please register to post." });
//    }
//     if (!req.file) {
//         return res.status(400).json({ error: "Profile image is required" });
//       }
      
// //    upload image on  cloudinary and response url from cloudinary
//       const postImage = await uploadImageToCloudinary(req.file.buffer);
//       console.log(postImage);

//       const createPosts = await productModel.create({
//         name,
//         description,
//         mobileNumber,
//         postImage,
//         user,
//         price,
//         category
//       });
//       res.json({
//         message: "product add successfully",
//         data: createPosts,
//       });
//       console.log("Saved Product:", createPosts);

    
// } catch (error) {
//     res.status(500).json({ error: error.message });

// }
// }


// Like/Unlike Product Controller

const likeProduct = async (req, res) => {
    console.log("User from token:", req.user); // ⬅⬅⬅ ADD THIS LINE
  const productId = req.params.id;
  const userId = req.user.id; // Assume user middleware ne req.user set kiya hai

  try {
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product nahi mila" });
    }

    const alreadyLiked = product.likes.includes(userId);

    if (alreadyLiked) {
      // Unlike
      product.likes = product.likes.filter(id => id.toString() !== userId);
    } else {
      // Like
      product.likes.push(userId);
    }

    await product.save();

    return res.status(200).json({
      message: alreadyLiked ? "Product unliked" : "Product liked",
      likes: product.likes, 
    });
  } catch (error) {
    console.error("Like Error:", error.message);
    return res.status(500).json({ error: "mistake, try again later." });
  }
};


// Comment on Product Controller

const commentProduct = async (req, res) => {
  const productId = req.params.id;
  const userId = req.user.id;
  const { text } = req.body;

  try {
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Comment text is required" });
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product nahi mila" });
    }

    // Add comment
    product.comments.push({
      user: userId,
      text,
    });

    await product.save();
    const updatedProduct = await productModel
      .findById(productId)
      .populate("comments.user", "userName email");
    return res.status(200).json({
      message: "Comment added successfully",
      comments: updatedProduct.comments,
    });
  } catch (error) {
    console.error("Comment Error:", error.message);
    return res.status(500).json({ error: "Mistake, try again later." });
  }
};

// delete comment -------------->>>>>>

const deleteComment = async (req, res) => {
  const productId = req.params.productId;
  const commentId = req.params.commentId;
  const userId = req.user.id;

  try {
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product nahi mila" });
    }

    // Find the comment
    const comment = product.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment nahi mila" });
    }

    // Sirf comment owner hi delete kar sakta hai
    if (comment.user.toString() !== userId) {
      return res.status(403).json({ error: "Tumhara comment nahi hai, delete nahi kar sakte" });
    }

   await productModel.findByIdAndUpdate(productId, {
  $pull: { comments: { _id: commentId } }
});

    await product.save();

    // Populate after deletion
    const updatedProduct = await productModel
      .findById(productId)
      .populate("comments.user", "userName email");

    return res.status(200).json({
      message: "Comment deleted successfully",
      comments: updatedProduct.comments,
    });
  } catch (error) {
    console.error("Delete Comment Error:", error.message);
    return res.status(500).json({ error: "Mistake, try again later." });
  }
};



// all comments ------->>>>>>

const getComments = async (req, res) => {
  const productId = req.params.productId;  // ya req.params.id — route ke hisaab se

  try {
    const product = await productModel
      .findById(productId)
      .populate("comments.user", "userName email");

    if (!product) {
      return res.status(404).json({ error: "Product nahi mila" });
    }

    return res.status(200).json({
      comments: product.comments,
    });
  } catch (error) {
    console.error("Get Comments Error:", error.message);
    return res.status(500).json({ error: "Mistake, try again later." });
  }
};


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




// ✅ Public Single Product Controller

const publicSingleProduct = async (req, res) => {

  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Product ID required" });
  }

  try {
    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({ error: "No product found" });
    }

    res.status(200).json({
      _id: product._id,
      name: product.name,
      description: product.description,
      mobileNumber: product.mobileNumber,
      price: product.price,
      image: product.postImage,
      likes: product.likes,
      category: product.category,
      location: product.location,
      sellerName: product.user.name,
    });
  } catch (error) {
    console.error(error.message || error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};


// user all products --------->>>>>>>

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
  const limit = parseInt(req.query.limit) || 15; // Default limit 12
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


  export  {addProduct,allProducts,deleteProduct,updateProduct,singleProduct,userProducts,publicSingleProduct,likeProduct,commentProduct,deleteComment,getComments}