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

  async extractTextFromBase64(base64ImageData) {
    try {
      console.log("Starting OCR for base64 image data");
      console.log(
        "Using API key:",
        this.apiKey ? "API key is set" : "NO API KEY FOUND",
      );

      // Remove data URL prefix if present (data:image/jpeg;base64,)
      const cleanBase64 = base64ImageData.replace(
        /^data:image\/[a-z]+;base64,/,
        "",
      );

      const requestBody = {
        requests: [
          {
            image: {
              content: cleanBase64,
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

      console.log("Sending request to Google Vision API with base64 data...");
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
}

module.exports = new OCRService();
