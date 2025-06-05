const axios = require("axios");

class OCRService {
  constructor() {
    this.apiKey = process.env.GOOGLE_CLOUD_API_KEY;
    this.apiUrl = "https://vision.googleapis.com/v1/images:annotate";
  }

  async extractTextFromImage(imageUrl) {
    try {
      console.log("Extracting text from image:", imageUrl);

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

      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const textAnnotations = response.data.responses[0].textAnnotations;

      if (textAnnotations && textAnnotations.length > 0) {
        // The first annotation contains the entire text
        return textAnnotations[0].description;
      }

      throw new Error("No text found in image");
    } catch (error) {
      console.error("OCR Error:", error.response?.data || error);
      throw error;
    }
  }
}

module.exports = new OCRService();
