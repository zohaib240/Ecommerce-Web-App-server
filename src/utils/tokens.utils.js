
import jwt from "jsonwebtoken"

const generateAccesstoken = (user) => {
  return String(jwt.sign({ email: user.email, id: user._id }, process.env.ACCESS_JWT_SECRET, {
    expiresIn: "1h",
  }));
};

const generateRefreshtoken = (user) => {
  return String(jwt.sign({ email: user.email, id: user._id }, process.env.REFRESH_JWT_SECRET, {
    expiresIn: "10d",
  }));
};


export {generateAccesstoken,generateRefreshtoken};







