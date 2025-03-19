import mongoose from "mongoose";
import bycript from "bcrypt"

const userSchema = new mongoose.Schema({
 
    userName: {
        type: String,
        required: [true, "userName is required"],
      },
      fullName: {
        type: String,
        required: [true, "fullName is required"],
      },
      profilePicture: {
        type: String,
        required: [false, "profileImage is required"],
      },
    
    email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },

},
{
    timestamps: true, // Automatically `createdAt` and `updatedAt` fields add karega
  });

userSchema.pre("save",async function (next) {
  if(!this.isModified('password'))return next()
  this.password = await bycript.hash(this.password,10)
next()
})

export default mongoose.model("User", userSchema);

