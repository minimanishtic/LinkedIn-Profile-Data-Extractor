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
 * @route GET /api/auth/zoho/connect
 * @desc Redirect to Zoho OAuth authorization URL
 * @access Public
 */
router.get("/zoho/connect", (req, res) => {
  try {
    const userId = req.query.userId;

    // Construct the Zoho OAuth authorization URL
    const authUrl = new URL("https://accounts.zoho.com/oauth/v2/auth");
    authUrl.searchParams.append("client_id", process.env.ZOHO_CLIENT_ID);
    authUrl.searchParams.append("redirect_uri", process.env.ZOHO_REDIRECT_URI);
    authUrl.searchParams.append("scope", "ZohoRecruit.modules.ALL");
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("access_type", "offline");
    authUrl.searchParams.append("state", userId);

    // Redirect the user to the Zoho OAuth authorization URL
    res.redirect(authUrl.toString());
  } catch (error) {
    console.error("Zoho connect error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route GET /api/auth/zoho/callback
 * @desc Handle Zoho OAuth callback
 * @access Public
 */
router.get("/zoho/callback", (req, res) => {
  try {
    const { code, state } = req.query;

    // Log the received code and state
    console.log("Zoho OAuth callback received", { code, state });

    // Return HTML response with auto-close script
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Zoho Connection</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }
            .message { margin: 20px; }
          </style>
        </head>
        <body>
          <h2>Zoho connected successfully!</h2>
          <p class="message">You can close this window.</p>
          <script>
            window.setTimeout(() => window.close(), 2000);
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Zoho callback error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route GET /api/auth/zoho/status/:userId
 * @desc Check Zoho connection status for a user
 * @access Public
 */
router.get("/zoho/status/:userId", (req, res) => {
  try {
    const { userId } = req.params;

    // TODO: Check if user has valid Zoho tokens in database

    // For now, return a placeholder response
    res.json({ connected: false, userId });
  } catch (error) {
    console.error("Zoho status error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
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
