const Anthropic = require("@anthropic-ai/sdk");

class AIService {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async parseLinkedInProfile(ocrText) {
    try {
      console.log("Parsing LinkedIn profile with Claude AI...");

      const prompt = `Extract the following information from this LinkedIn profile text and return ONLY a JSON object with these fields:
      - first_name
      - last_name  
      - email
      - phone
      - current_employer
      - current_job_title
      - experience_years (number only)
      - skills (array of skills)
      - city
      - state
      - country
      - linkedin_url
      - education (highest qualification)
      
      OCR Text:
      ${ocrText}
      
      Return ONLY the JSON object, no markdown, no explanation, just pure JSON.`;

      const response = await this.anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const responseText = response.content[0].text;
      return JSON.parse(responseText);
    } catch (error) {
      console.error("AI Parsing Error:", error);
      throw error;
    }
  }
}

module.exports = new AIService();
