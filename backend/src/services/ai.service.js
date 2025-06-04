const OpenAI = require("openai");

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async parseLinkedInProfile(ocrText) {
    try {
      console.log("Parsing LinkedIn profile with AI...");

      const prompt = `Extract the following information from this LinkedIn profile text and return as JSON:
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
      
      Return only valid JSON, no additional text.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const responseText = completion.choices[0].message.content;
      return JSON.parse(responseText);
    } catch (error) {
      console.error("AI Parsing Error:", error);
      throw error;
    }
  }
}

module.exports = new AIService();
