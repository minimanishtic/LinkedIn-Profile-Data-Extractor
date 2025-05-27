const express = require("express");
const cors = require("cors");
const { errorHandler } = require("./src/middleware/auth.middleware");

// Import routes
const authRoutes = require("./src/routes/auth.routes");
const uploadRoutes = require("./src/routes/upload.routes");

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "https://hook.eu1.make.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "x-auth-token"],
  }),
);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
