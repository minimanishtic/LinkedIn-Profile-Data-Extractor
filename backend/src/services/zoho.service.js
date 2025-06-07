const axios = require("axios");

class ZohoService {
  constructor() {
    this.baseUrl = "https://recruit.zoho.in/recruit/v2";

    // Don't require access token - it might not exist
    this.accessToken = process.env.ZOHO_ACCESS_TOKEN || null;
    this.refreshToken = process.env.ZOHO_REFRESH_TOKEN;
    this.clientId = process.env.ZOHO_CLIENT_ID;
    this.clientSecret = process.env.ZOHO_CLIENT_SECRET;

    console.log("ZohoService initialized:", {
      hasAccessToken: !!this.accessToken,
      accessTokenValue:
        this.accessToken === "undefined"
          ? "STRING_UNDEFINED"
          : this.accessToken
            ? "EXISTS"
            : "NULL",
      hasRefreshToken: !!this.refreshToken,
      refreshTokenPreview: this.refreshToken
        ? this.refreshToken.substring(0, 20) + "..."
        : "MISSING",
      hasClientId: !!this.clientId,
      hasClientSecret: !!this.clientSecret,
    });

    // If no access token but refresh token exists, get a new access token immediately
    if (!this.accessToken && this.refreshToken) {
      console.log("No access token found, will refresh on first use");
    }
  }

  // Get user's Zoho credentials from database (placeholder for now)
  async getUserCredentials(userId) {
    try {
      // If no access token, refresh first
      if (!this.accessToken) {
        console.log("No access token available, refreshing...");
        await this.refreshAccessToken(this.refreshToken);
      }

      return {
        access_token: this.accessToken,
        api_domain: "https://recruit.zoho.in",
      };
    } catch (error) {
      console.error("Error getting user credentials:", error);
      throw error;
    }
  }

  async refreshAccessToken(refreshToken) {
    console.log("Attempting to refresh token...");
    console.log(
      "Refresh token:",
      refreshToken ? refreshToken.substring(0, 20) + "..." : "NO REFRESH TOKEN",
    );

    if (!refreshToken) {
      throw new Error("Refresh token is missing");
    }

    const params = new URLSearchParams();
    params.append("refresh_token", refreshToken);
    params.append("client_id", this.clientId);
    params.append("client_secret", this.clientSecret);
    params.append("grant_type", "refresh_token");

    try {
      const response = await axios.post(
        "https://accounts.zoho.in/oauth/v2/token",
        params.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      console.log("Token refresh successful!");
      this.accessToken = response.data.access_token;

      if (response.data.refresh_token) {
        this.refreshToken = response.data.refresh_token;
        console.log("New refresh token received");
      }

      return this.accessToken;
    } catch (error) {
      console.error("Token refresh failed:", {
        status: error.response?.status,
        error: error.response?.data?.error,
        error_description: error.response?.data?.error_description,
      });
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

  async createCandidate(candidateData) {
    console.log("Creating candidate in Zoho Recruit...");
    console.log(
      "Current access token:",
      this.accessToken ? "EXISTS" : "MISSING",
    );

    // Check if we need to refresh the token
    if (!this.accessToken || this.accessToken === "undefined") {
      console.log("No valid access token, refreshing...");
      try {
        await this.refreshAccessToken(this.refreshToken);
        console.log(
          "Token refreshed successfully, new token:",
          this.accessToken ? "OBTAINED" : "FAILED",
        );
      } catch (error) {
        console.error("Failed to refresh token:", error.message);
        throw new Error("Unable to obtain access token: " + error.message);
      }
    }

    try {
      console.log("Making API call to create candidate...");
      const response = await axios.post(
        "https://recruit.zoho.in/recruit/v2/Candidates",
        {
          data: [candidateData],
        },
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Candidate created successfully");
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("Token expired (401), attempting refresh...");
        await this.refreshAccessToken(this.refreshToken);

        // Retry with new token
        const retryResponse = await axios.post(
          "https://recruit.zoho.in/recruit/v2/Candidates",
          {
            data: [candidateData],
          },
          {
            headers: {
              Authorization: `Zoho-oauthtoken ${this.accessToken}`,
              "Content-Type": "application/json",
            },
          },
        );

        return retryResponse.data;
      }

      console.error(
        "Error creating candidate:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }
}

module.exports = ZohoService;
