const axios = require("axios");

class ZohoService {
  constructor() {
    this.baseUrl = "https://recruit.zoho.in/recruit/v2";
  }

  // Get user's Zoho credentials from database (placeholder for now)
  async getUserCredentials(userId) {
    try {
      // Try using existing access token first
      const accessToken = process.env.ZOHO_ACCESS_TOKEN;

      // For now, return static credentials
      // In production, this would fetch from database per user
      return {
        access_token: accessToken,
        api_domain: "https://recruit.zoho.in",
      };
    } catch (error) {
      // If token expired, refresh it
      const newToken = await this.refreshAccessToken(
        process.env.ZOHO_REFRESH_TOKEN,
      );
      return {
        access_token: newToken,
        api_domain: "https://recruit.zoho.in",
      };
    }
  }

  // Refresh access token if needed
  async refreshAccessToken(refreshToken) {
    try {
      console.log("Attempting to refresh token...");
      console.log(
        "Refresh token:",
        refreshToken
          ? `${refreshToken.substring(0, 20)}...`
          : "NO REFRESH TOKEN",
      );
      console.log("Client ID:", process.env.ZOHO_CLIENT_ID ? "Set" : "Missing");
      console.log(
        "Client Secret:",
        process.env.ZOHO_CLIENT_SECRET ? "Set" : "Missing",
      );

      const requestBody = {
        refresh_token: refreshToken,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type: "refresh_token",
      };

      console.log("Request body:", JSON.stringify(requestBody, null, 2));

      const response = await axios.post(
        "https://accounts.zoho.in/oauth/v2/token",
        requestBody,
      );

      console.log("Token refreshed successfully");
      process.env.ZOHO_ACCESS_TOKEN = response.data.access_token;

      return response.data.access_token;
    } catch (error) {
      console.error("Token refresh error:", error.response?.data || error);
      throw error;
    }
  }

  // Map LinkedIn data to Zoho fields
  mapToZohoFields(linkedInData) {
    return {
      First_Name: linkedInData.first_name || "",
      Last_Name: linkedInData.last_name || "",
      Email: linkedInData.email || "",
      Phone: linkedInData.phone || "",
      Mobile: linkedInData.mobile || linkedInData.phone || "",
      Current_Employer: linkedInData.current_employer || "",
      Current_Job_Title: linkedInData.current_job_title || "",
      Experience_in_Years: linkedInData.experience_years || 0,
      Skill_Set: Array.isArray(linkedInData.skills)
        ? linkedInData.skills.join(", ")
        : "",
      City: linkedInData.city || "",
      State: linkedInData.state || "",
      Country: linkedInData.country || "",
      LinkedIn__s: linkedInData.linkedin_url || "",
      Website: linkedInData.website || "",
      Highest_Qualification_Held: linkedInData.education || "",
      Source: "LinkedIn",
      Candidate_Status: "New",
    };
  }

  // Create candidate in Zoho Recruit
  async createCandidate(candidateData, accessToken) {
    try {
      const zohoData = this.mapToZohoFields(candidateData);

      const response = await axios.post(
        `${this.baseUrl}/Candidates`,
        {
          data: [zohoData],
        },
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired, refresh and retry
        console.log("Token expired, refreshing...");
        const newToken = await this.refreshAccessToken(
          process.env.ZOHO_REFRESH_TOKEN,
        );

        // Retry with new token
        return this.createCandidate(candidateData, newToken);
      }
      console.error("Zoho API Error:", error.response?.data || error);
      throw error;
    }
  }
}

module.exports = new ZohoService();
