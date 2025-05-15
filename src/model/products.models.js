import mongoose from "mongoose";


const productSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, "title is required"],
    },
    description: {
      type: String,
      required: [true, "description is required"],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    mobileNumber: {
      type : Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },  
    postImage: {
        type: String,
        required: [true, "image is required"],
      },
     user:{ 
     type: mongoose.Schema.Types.ObjectId, 
     ref: "User",
     required: true
     },
     likes: [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
      }],
},
{ timestamps: true }
);


export default mongoose.model("Product",productSchema ,'products');








