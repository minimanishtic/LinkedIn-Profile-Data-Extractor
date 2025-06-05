const axios = require("axios");

class OCRService {
  constructor() {
    this.apiKey = process.env.GOOGLE_CLOUD_API_KEY;
    this.apiUrl = "https://vision.googleapis.com/v1/images:annotate";
  }

  async extractTextFromImage(imageUrl) {
    try {
      console.log("Starting OCR for image:", imageUrl);
      console.log(
        "Using API key:",
        this.apiKey ? "API key is set" : "NO API KEY FOUND",
      );

      const requestBody = {
        requests: [
          {
            image: {
              source: {
                imageUri: imageUrl,
              },
            },
            features: [
              {
                type: "TEXT_DETECTION",
                maxResults: 1,
              },
            ],
          },
        ],
      };

      console.log("Sending request to Google Vision API...");
      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log(
        "Google Vision API response:",
        JSON.stringify(response.data, null, 2),
      );

      if (response.data.responses && response.data.responses[0]) {
        const textAnnotations = response.data.responses[0].textAnnotations;

        if (textAnnotations && textAnnotations.length > 0) {
          console.log(
            "Text found! Length:",
            textAnnotations[0].description.length,
          );
          return textAnnotations[0].description;
        }

        // Check for errors in response
        if (response.data.responses[0].error) {
          throw new Error(
            `Vision API Error: ${JSON.stringify(response.data.responses[0].error)}`,
          );
        }
      }

      throw new Error("No text found in image");
    } catch (error) {
      console.error("OCR Error Details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  }

  async extractTextFromBase64(base64Image) {
    try {
      console.log("Processing base64 image...");

      // Remove data URL prefix if present
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

      const requestBody = {
        requests: [
          {
            image: {
              content: base64Data,
            },
            features: [
              {
                type: "TEXT_DETECTION",
                maxResults: 1,
              },
            ],
          },
        ],
      };

      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.responses && response.data.responses[0]) {
        const textAnnotations = response.data.responses[0].textAnnotations;

        if (textAnnotations && textAnnotations.length > 0) {
          return textAnnotations[0].description;
        }
      }

      throw new Error("No text found in image");
    } catch (error) {
      console.error("OCR Error:", error.response?.data || error);
      throw error;
    }
  }
}

module.exports = new OCRService();
