import jwt from "jsonwebtoken";
import User from  "../model/users.model.js"
import bcrypt from "bcrypt"
import fs from "fs";
import { uploadImageToCloudinary } from "../utils/cloudinary.utils.js";
import { generateAccesstoken, generateRefreshtoken } from "../utils/tokens.utils.js";


// cloudinary image upload k lye -------->>>>

// cloudinary.config({ 
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
// });

// // Tokens ------>>>>>

// const generateAccesstoken = (user) =>{
//   return jwt.sign({email : user.email},process.env.ACCESS_JWT_SECRET, {
//    expiresIn : "6h"
//   })
//  }
//  const generateRefreshtoken = (user) =>{
//   return jwt.sign({email : user.email},process.env.REFRESH_JWT_SECRET, {
//    expiresIn : "6h"
//   })
//  }

//  register User-------->>>>>

const registerUser = async (req, res) => {
  const { userName, fullName, email, password } = req.body;

  if (!userName || !fullName || !email || !password) {
    return res.status(400).json({ error: "Email or password missing" });
  }
  
  try {
    const user = await User.findOne({ email });

    if (user) {
      return res.status(401).json({ message: "User already exists" });
    }

    // Check if image is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Profile image is required" });
    }
    const profilePicture = await uploadImageToCloudinary(req.file.buffer);
    console.log(profilePicture);
    
    const createUser = await User.create({
      userName,
      fullName,
      email,
      password,
      profilePicture,
    });
    res.json({
      message: "User registered successfully",
      data: createUser,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// login User --------->>>>>>

const loginUser = async (req,res) => {
const{email,password} = req.body
if (!email) return res.status(400).json({ message: "email required" });
if (!password) return res.status(400).json({ message: "password required" });

  // email mujood ha bhi ya nahi ha
const user = await User.findOne({email})
if(!user)return res.status(404).json({messege : "user no found"})

  // password compare krwayenga bcrypt
const ispasswordValid = bcrypt.compare(password,user.password)  
if(!ispasswordValid) return res.status().json({messege : "incorrect password"})

// token generate
const accessToken =generateAccesstoken(user)
const refreshToken =generateRefreshtoken(user)

res.cookie("refreshToken", refreshToken ,  { http: true, secure: false })
res.json({
message : "login successfully",
refreshToken,
accessToken,
data : user 
})
}


// logout user --------->>>>>

const logoutUser = (req, res) => {
  // Check if the user is authenticated
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized. Please log in first." });
  }
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", 
    sameSite: "Strict" // Secure cookie policy
  });
  res.json({ message: "Logout successful." });
};


// Get all Users
const getAllUsers = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find({});

    if (users.length === 0) {
      return res.status(200).json({ message: "No users found!" });
    }

    // Send response with users data
    return res.status(200).json({
      message: "Users fetched successfully!",
      data: users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong while fetching users!",
      error: error.message,
    });
  }
};


// refreresh Token ------->>>>>>>>

const refreshToken = async (req,res)=>{
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken
  console.log("Cookies:", req.cookies); // Debug cookies
  console.log("Body:", req.body); 
  
  if(!refreshToken)
  return res.status(404).json({
    messege : "no token found"
  })
  
  const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
  
  const user = await User.findOne({email : decodedToken.email})
  
  if (!user) return res.status(404).json({ message: "invalid token" });
  
  const generateToken = generateAccesstoken(user)
  res.json({ message: "access token generated", accesstoken: generateToken ,decodedToken});
  
  }


// const uploadImageToCloudinary = async (localpath) => {
//   try {
//     const uploadResult = await cloudinary.uploader.upload(localpath, {
//       resource_type: "auto",
//     });

//     if (uploadResult) {
//       fs.unlinkSync(localpath); // Delete local image
//     }

//     return uploadResult.url;
//   } catch (error) {
//     console.log(error);
//     throw new Error("Error uploading image to Cloudinary");
//   }
// };


export {registerUser,loginUser,logoutUser,refreshToken,getAllUsers}