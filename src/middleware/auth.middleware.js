// import jwt from "jsonwebtoken";

// const authenticateUser = async (req, res, next) => {
//     const token = req.headers["authorization"];
//     if (!token) return res.status(404).json({ message: "No token found" });
  
//     const tokenWithoutBearer = token.split(" ")[1]; // Remove 'Bearer ' part
  
//     jwt.verify(tokenWithoutBearer, process.env.ACCESS_JWT_SECRET, (err, user) => {
//       if (err) return res.status(403).json({ message: "Invalid token" });
//       req.user = user;
//       next();
//     });
//   };
  
// export default authenticateUser


import jwt from "jsonwebtoken";

const authenticateUser = async (req, res, next) => {
  // Step 1: Get the token from headers
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(404).json({ message: "No token found" });
  }

  // Step 2: Remove 'Bearer ' part from the token
  const tokenWithoutBearer = token.split(" ")[1];

  if (!tokenWithoutBearer) {
    return res.status(403).json({ message: "Token format is incorrect" });
  }

  // Step 3: Verify the token using the secret
  jwt.verify(tokenWithoutBearer, process.env.ACCESS_JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Error in token verification:", err);  // Log the error for debugging
      return res.status(403).json({ message: "Invalid token" });
    }

    // Step 4: Attach the user data to the request object
    req.user = user;
    next();  // Proceed to the next middleware or route handler
  });
};

export default authenticateUser;

