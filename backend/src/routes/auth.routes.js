const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { generateToken, verifyToken } = require("../utils/token.utils");

/**
 * @route POST /api/auth/login
 * @desc Login user and get token
 * @access Public
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // This is a placeholder. In a real app, you would validate against a database
    if (username === "admin" && password === "password") {
      const token = generateToken({ username });
      return res.json({ success: true, token });
    }

    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route GET /api/auth/verify
 * @desc Verify user token
 * @access Private
 */
router.get("/verify", verifyToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

/**
 * @route POST /api/auth/zoho/callback
 * @desc Handle Zoho OAuth callback
 * @access Public
 */
router.post("/zoho/callback", async (req, res) => {
  try {
    const { code } = req.body;

    // This would be handled by the zoho service in a real implementation
    // For now, just return a success message
    res.json({ success: true, message: "Zoho authentication successful" });
  } catch (error) {
    console.error("Zoho callback error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
