const axios = require("axios");

class ZohoService {
  constructor() {
    this.baseUrl = "https://recruit.zoho.com/recruit/v2";
  }

  // Get user's Zoho credentials from database (placeholder for now)
  async getUserCredentials(userId) {
    // TODO: Fetch from database
    // For now, return test credentials
    return {
      access_token: process.env.ZOHO_ACCESS_TOKEN,
      api_domain: "https://recruit.zoho.com",
    };
  }

  // Refresh access token if needed
  async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post(
        "https://accounts.zoho.com/oauth/v2/token",
        {
          refresh_token: refreshToken,
          client_id: process.env.ZOHO_CLIENT_ID,
          client_secret: process.env.ZOHO_CLIENT_SECRET,
          grant_type: "refresh_token",
        },
      );
      return response.data.access_token;
    } catch (error) {
      console.error("Token refresh error:", error);
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
      console.error("Zoho API Error:", error.response?.data || error);
      throw error;
    }
  }
}

module.exports = new ZohoService();
