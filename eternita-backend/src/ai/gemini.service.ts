import { GoogleGenAI } from "@google/genai";
import { Injectable } from "@nestjs/common";
import type { PermittedEntry } from "./access-context";
import { buildGeminiPrompt } from "./gemini-prompt";

export interface GeminiAnswer {
  answer: string;
  modelName: string;
  tokenUsage?: unknown;
}

@Injectable()
export class GeminiService {
  private ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  async answerQuestion(
    question: string,
    permittedEntries: PermittedEntry[],
  ): Promise<GeminiAnswer> {
    const prompt = buildGeminiPrompt(question, permittedEntries);

    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    return {
      answer: response.text ?? "",
      modelName: "gemini-2.5-flash",
      tokenUsage: response.usageMetadata,
    };
  }
}
