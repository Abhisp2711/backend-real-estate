import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Register User
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role = "buyer" } = req.body; // Default role to "buyer"

    // Check if all required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Validate role
    if (!["buyer", "seller", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role selected" });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error("Registration Error:", err.message);
    res.status(500).json({ error: "Server error, please try again later" });
  }
});

// Login User
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("login attempt for :", email);
    // Validate request
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log("user not found in DB");
      return res.status(404).json({ error: "User not found" });
    }

    console.log("user found :", user);

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });

  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ error: "Server error, please try again later" });
  }
});


export default router;
