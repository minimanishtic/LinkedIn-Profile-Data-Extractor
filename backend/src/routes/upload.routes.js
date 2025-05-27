const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const zohoService = require("../services/zoho.service");

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
