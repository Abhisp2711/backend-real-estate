import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    let token = req.header("Authorization");
    
    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    // Handle "Bearer TOKEN" format
    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1]; // Extract the actual token
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export default authMiddleware;
