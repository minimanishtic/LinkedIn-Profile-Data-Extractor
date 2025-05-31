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
      gofullpage_webhook: "/api/gofullpage-webhook"  // ← ADDED THIS LINE
    },
  });
});

app.get("/api/test", (req, res) => {
  res.json({ status: "OK", time: new Date() });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "API is healthy" });
});

// GoFullpage Webhook Endpoint ← ADD THIS ENTIRE SECTION
app.post("/api/gofullpage-webhook", async (req, res) => {
  try {
    console.log("Received GoFullpage data:", req.body);
    
    // Extract screenshot data from GoFullpage
    const { 
      screenshot_url,
      page_title,
      page_url,
      timestamp,
      ...otherData 
    } = req.body;

    // TODO: Add Zoho Recruit API integration here
    // For now, just acknowledge receipt
    
    res.json({
      status: "success",
      message: "GoFullpage data received",
      received_data: {
        screenshot_url,
        page_title,
        page_url,
        timestamp
      }
    });
    
  } catch (error) {
    console.error("Error processing GoFullpage data:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to process GoFullpage data",
      error: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

module.exports = app;
