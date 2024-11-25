import {
  GoogleGenerativeAI
} from "@google/generative-ai";
import { NEXT_PUBLIC_GOOGLE_GEMINI_KEY } from "../KEYS.js";
import { ModelHistory, UserHistory } from "../config/GeminiData.js";

export default class Gemini extends GoogleGenerativeAI {
  api;
  AI;
  temperature;
  topP;
  topK;
  maxOutputTokens;
  responseMimeType;
  model;

  constructor(temperature = 1, topP = 0.95, topK = 40, maxOutputTokens = 8192, responseMimeType = "application/json", model = "gemini-1.5-flash") {
    super(NEXT_PUBLIC_GOOGLE_GEMINI_KEY);
    this.temperature = temperature;
    this.topP = topP;
    this.topK = topK;
    this.maxOutputTokens = maxOutputTokens;
    this.responseMimeType = responseMimeType;
    const generationConfig = {
      temperature: temperature,
      topP: topP,
      topK: topK,
      maxOutputTokens: maxOutputTokens,
      responseMimeType: responseMimeType,
    };
    this.model = this.getGenerativeModel({ model: model }).startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {
              text: UserHistory,
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: ModelHistory,
            },
          ],
        },
      ],
    });
  }
}
