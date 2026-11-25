import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { ContextFilterService } from "./context-filter.service";
import { GeminiService } from "./gemini.service";

@Controller("ai")
@UseGuards(AuthGuard)
export class AiController {
  constructor(
    private readonly contextFilter: ContextFilterService,
    private readonly geminiService: GeminiService,
  ) {}

  @Post("ask")
  async askQuestion(
    @Body() body: { ownerUid: string; question: string },
  ) {
    const requesterUid = "current-user-uid";

    const entries = await this.getEntries(body.ownerUid);

    const permitted = await this.contextFilter.filterEntries(
      requesterUid,
      body.ownerUid,
      entries,
    );

    if (permitted.length === 0) {
      return {
        answer: "I cannot answer because no permitted records are available.",
        citations: []
      };
    }

    const answer = await this.geminiService.answerQuestion(
      body.question,
      permitted,
    );

    return {
      answer,
      citations: permitted.map((entry) => entry.entryDate)
    };
  }

  private async getEntries(_ownerUid: string) {
    // TODO: Retrieve the owner's entries from the persistence service.
    return [];
  }
}