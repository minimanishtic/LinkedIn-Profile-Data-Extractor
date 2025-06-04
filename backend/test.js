const express = require("express");
const cors = require("cors");
const ocrService = require("./src/services/ocr.service");
const aiService = require("./src/services/ai.service");
const zohoService = require("./src/services/zoho.service");
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
      gofullpage_webhook: "/api/gofullpage-webhook", // ← ADDED THIS LINE
    },
  });
});

app.get("/api/test", (req, res) => {
  res.json({ status: "OK", time: new Date() });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "API is healthy" });
});

// GoFullpage Webhook Endpoint - Complete Flow
app.post("/api/gofullpage-webhook", async (req, res) => {
  try {
    console.log("Received GoFullpage data:", req.body);

    const { screenshot_url, userId = "default" } = req.body;

    if (!screenshot_url) {
      return res.status(400).json({
        status: "error",
        message: "Screenshot URL is required",
      });
    }

    // Step 1: Extract text from image using OCR
    console.log("Step 1: Running OCR...");
    const ocrText = await ocrService.extractTextFromImage(screenshot_url);
    console.log("OCR completed. Text length:", ocrText.length);

    // Step 2: Parse LinkedIn profile using AI
    console.log("Step 2: Parsing with AI...");
    const profileData = await aiService.parseLinkedInProfile(ocrText);
    console.log("AI parsing completed:", profileData);

    // Step 3: Get user's Zoho credentials
    console.log("Step 3: Getting user credentials...");
    const userCreds = await zohoService.getUserCredentials(userId);

    // Step 4: Create candidate in Zoho
    console.log("Step 4: Creating candidate in Zoho...");
    const zohoResponse = await zohoService.createCandidate(
      profileData,
      userCreds.access_token,
    );
    console.log("Zoho candidate created:", zohoResponse);

    // Return success response
    res.json({
      status: "success",
      message: "LinkedIn profile processed and added to Zoho Recruit",
      data: {
        ocrTextLength: ocrText.length,
        parsedProfile: profileData,
        zohoResponse: zohoResponse,
      },
    });
  } catch (error) {
    console.error("Error processing LinkedIn profile:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to process LinkedIn profile",
      error: error.message,
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

module.exports = app;
