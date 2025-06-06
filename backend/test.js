const express = require("express");
const cors = require("cors");
const multer = require("multer");
const ocrService = require("./src/services/ocr.service");
const aiService = require("./src/services/ai.service");
const zohoService = require("./src/services/zoho.service");
const app = express();

// Add multer for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

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
app.post("/api/gofullpage-webhook", upload.single("file"), async (req, res) => {
  try {
    console.log("=== INCOMING GOFULLPAGE DATA ===");
    console.log("Body:", req.body);
    console.log("File:", req.file);
    console.log("================================");

    let imageBase64;
    let userId = "default";

    // Check if we have file data from multer
    if (req.file) {
      // Convert buffer to base64
      imageBase64 = req.file.buffer.toString("base64");
      console.log("Converted file to base64, length:", imageBase64.length);
    } else if (req.body.data) {
      // If data comes as a buffer in body (from Make.com)
      if (Buffer.isBuffer(req.body.data)) {
        imageBase64 = req.body.data.toString("base64");
      } else if (typeof req.body.data === "string") {
        // If it's already base64 or hex string
        imageBase64 = req.body.data;
      }
    }

    // Get userId if provided
    if (req.body.userId) {
      userId = req.body.userId;
    }

    if (!imageBase64) {
      return res.status(400).json({
        status: "error",
        message: "No image data found in request",
      });
    }

    // Step 1: Extract text using OCR
    console.log("Step 1: Running OCR on base64 image...");
    const ocrText = await ocrService.extractTextFromBase64(imageBase64);
    console.log("OCR completed. Text length:", ocrText.length);

    // Step 2: Parse with AI
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
