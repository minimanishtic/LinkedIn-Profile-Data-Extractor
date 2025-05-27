const axios = require("axios");

/**
 * Get Zoho OAuth token
 * @returns {Promise<string>} Zoho access token
 */
async function getZohoToken() {
  try {
    // In a real implementation, this would use the client ID, client secret, and refresh token
    // to get a new access token from Zoho
    // For now, just return a placeholder
    return "zoho-access-token-placeholder";
  } catch (error) {
    console.error("Error getting Zoho token:", error);
    throw new Error("Failed to get Zoho token");
  }
}

/**
 * Upload a resume to Zoho Recruit
 * @param {Object} file - File object with buffer and metadata
 * @param {string} candidateName - Name of the candidate
 * @param {Object} customFields - Custom fields for the candidate
 * @returns {Promise<Object>} Upload result
 */
async function uploadResume(file, candidateName, customFields = {}) {
  try {
    const token = await getZohoToken();

    // In a real implementation, this would make an API call to Zoho Recruit
    // For now, just return a success object
    return {
      id: "candidate-" + Date.now(),
      name: candidateName,
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error uploading resume to Zoho:", error);
    throw new Error("Failed to upload resume to Zoho");
  }
}

/**
 * Upload multiple resumes to Zoho Recruit
 * @param {Array<Object>} files - Array of file objects
 * @param {Array<string>} candidateNames - Array of candidate names
 * @param {Object} customFields - Custom fields for the candidates
 * @returns {Promise<Array<Object>>} Upload results
 */
async function uploadMultipleResumes(
  files,
  candidateNames = [],
  customFields = {},
) {
  try {
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const name = candidateNames[i] || "Unknown";

      // Add a delay between uploads to prevent rate limiting
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      const result = await uploadResume(files[i], name, customFields);
      results.push(result);
    }

    return results;
  } catch (error) {
    console.error("Error uploading multiple resumes to Zoho:", error);
    throw new Error("Failed to upload multiple resumes to Zoho");
  }
}

/**
 * Initialize Zoho OAuth flow
 * @returns {string} Authorization URL
 */
function getZohoAuthUrl() {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const redirectUri = process.env.ZOHO_REDIRECT_URI;
  const scope = "ZohoRecruit.candidates.ALL";

  return `https://accounts.zoho.com/oauth/v2/auth?scope=${scope}&client_id=${clientId}&response_type=code&access_type=offline&redirect_uri=${redirectUri}`;
}

/**
 * Exchange authorization code for access token
 * @param {string} code - Authorization code from Zoho
 * @returns {Promise<Object>} Token response
 */
async function exchangeCodeForToken(code) {
  try {
    const clientId = process.env.ZOHO_CLIENT_ID;
    const clientSecret = process.env.ZOHO_CLIENT_SECRET;
    const redirectUri = process.env.ZOHO_REDIRECT_URI;

    const response = await axios.post(
      "https://accounts.zoho.com/oauth/v2/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    throw new Error("Failed to exchange code for token");
  }
}

module.exports = {
  getZohoToken,
  uploadResume,
  uploadMultipleResumes,
  getZohoAuthUrl,
  exchangeCodeForToken,
};
