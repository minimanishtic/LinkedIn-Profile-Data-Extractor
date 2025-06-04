const vision = require("@google-cloud/vision");

class OCRService {
  constructor() {
    // Initialize the Google Vision client
    this.client = new vision.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_CLOUD_KEYFILE,
    });
  }

  async extractTextFromImage(imageUrl) {
    try {
      console.log("Extracting text from image:", imageUrl);

      // Perform text detection on the image file
      const [result] = await this.client.textDetection(imageUrl);
      const detections = result.textAnnotations;

      if (detections && detections.length > 0) {
        // The first annotation contains the entire text
        return detections[0].description;
      }

      throw new Error("No text found in image");
    } catch (error) {
      console.error("OCR Error:", error);
      throw error;
    }
  }
}

module.exports = new OCRService();
