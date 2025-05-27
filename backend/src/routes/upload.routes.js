const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const zohoService = require("../services/zoho.service");
const { v4: uuidv4 } = require("uuid");

/**
 * @route POST /api/upload
 * @desc Upload candidate data from Make.com webhook
 * @access Public
 */
router.post("/", async (req, res) => {
  try {
    const { candidateData, userId, webhookId } = req.body;

    // Validate required fields
    if (!candidateData) {
      return res
        .status(400)
        .json({ success: false, error: "Candidate data is required" });
    }

    const { first_name, last_name, email } = candidateData;

    if (!first_name) {
      return res
        .status(400)
        .json({ success: false, error: "First name is required" });
    }

    if (!last_name) {
      return res
        .status(400)
        .json({ success: false, error: "Last name is required" });
    }

    if (!email) {
      return res
        .status(400)
        .json({ success: false, error: "Email is required" });
    }

    // Log the received data
    console.log(
      "Received candidate data:",
      JSON.stringify(candidateData, null, 2),
    );
    console.log("User ID:", userId);
    console.log("Webhook ID:", webhookId);

    // TODO: Call Zoho API to create candidate record

    // Generate a UUID for the record
    const recordId = uuidv4();
    const timestamp = new Date().toISOString();

    res.json({
      success: true,
      message: "Candidate data received",
      recordId,
      timestamp,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/**
 * @route POST /api/upload/resume
 * @desc Upload resume to Zoho Recruit
 * @access Private
 */
router.post("/resume", verifyToken, async (req, res) => {
  try {
    const { file, candidateName, customFields } = req.body;

    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "No file provided" });
    }

    // In a real implementation, this would call the zoho service to upload the file
    // For now, just return a success message
    const result = await zohoService.uploadResume(
      file,
      candidateName,
      customFields,
    );

    res.json({
      success: true,
      message: "File uploaded successfully",
      data: result,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route POST /api/upload/bulk
 * @desc Upload multiple resumes to Zoho Recruit
 * @access Private
 */
router.post("/bulk", verifyToken, async (req, res) => {
  try {
    const { files, candidateNames, customFields } = req.body;

    if (!files || !files.length) {
      return res
        .status(400)
        .json({ success: false, message: "No files provided" });
    }

    // In a real implementation, this would call the zoho service to upload multiple files
    // For now, just return a success message
    const results = await zohoService.uploadMultipleResumes(
      files,
      candidateNames,
      customFields,
    );

    res.json({
      success: true,
      message: "Files uploaded successfully",
      data: results,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
