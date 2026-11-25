import { GoogleGenAI } from "@google/genai";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GeminiService {
  private ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  async answerQuestion(
    question: string,
    permittedEntries: any[],
  ) {
    const context = permittedEntries
      .map((entry) => {
        return `Entry ${entry.entryId} (${entry.entryDate}): ${entry.summary}`;
      })
      .join("\n");

    const prompt = `
Answer only using the entries below.
Do not invent memories, people, dates, or facts.
Do not pretend to be the owner.
If the answer is not in the entries, say you cannot answer.
Cite the entry date for every claim.

Entries:
${context}

Question:
${question}
`;

    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    return response.text ?? "";
  }
}