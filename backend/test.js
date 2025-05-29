const express = require("express");
const cors = require("cors");
const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// API Routes
app.get("/", (req, res) => {
  res.json({
    message: "GoFullpage to Zoho Recruit API",
    status: "Running",
    endpoints: {
      test: "/api/test",
      health: "/api/health",
    },
  });
});

app.get("/api/test", (req, res) => {
  res.json({ status: "OK", time: new Date() });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "API is healthy" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

module.exports = app;
