const axios = require("axios");
const ZohoService = require("../src/services/zoho.service");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("Testing token refresh...");

    // Force a token refresh by calling refreshAccessToken directly
    const refreshToken = process.env.ZOHO_REFRESH_TOKEN;

    if (!refreshToken) {
      return res.status(500).json({
        error: "No refresh token in environment variables",
        hasRefreshToken: false,
      });
    }

    console.log("Refresh token found, attempting refresh...");
    const newAccessToken = await ZohoService.refreshAccessToken(refreshToken);

    console.log("Token refreshed successfully, testing with API call...");

    // Test the new token by making a simple API call
    const testResponse = await axios.get(
      "https://recruit.zoho.in/recruit/v2/settings/fields?module=Candidates",
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${newAccessToken}`,
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Token refresh successful!",
      tokenRefreshed: true,
      newTokenWorks: testResponse.status === 200,
      tokenPreview: newAccessToken.substring(0, 20) + "...",
    });
  } catch (error) {
    console.error("Test refresh error:", error);
    return res.status(500).json({
      error: "Token refresh failed",
      details: error.response?.data || error.message,
      status: error.response?.status,
    });
  }
};
