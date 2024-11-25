import {OpenAI} from "openai";

export default class OpenAI {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error("API key is required to initialize OpenAI.");
    }

  }

  /**
   * Create a structured user prompt for OpenAI
   * @param {string} inputData - Input data for the product
   * @returns {string} - A formatted user prompt
   */
  createOpenAIUserPrompt(inputData) {
    return `
    Generate JSON product details for eCommerce platforms like Amazon, Myntra, and Flipkart.
    Use the provided input data to create:
    - Title
    - Categories
    - Features
    - About This Item
    - Description (max 200 words)
    - Color options
    - Price

    Example Input Data:
    ${inputData}

    Ensure the content is engaging and platform-optimized.
    `;
  }

  /**
   * Generate AI response using OpenAI
   * @param {string} userPrompt - Formatted user prompt
   * @returns {Promise<string>} - AI-generated product information
   */
  async generateResponse(userPrompt) {
    const response = await this.api.createCompletion({
      model: "text-davinci-003",
      prompt: userPrompt,
      temperature: 0.7,
      max_tokens: 2048,
    });
    console.log({ response });
    return response.data.choices[0].text.trim();
  }
}
