import { Module } from "@nestjs/common";
import { PolicyModule } from "../policy/policy.module";
import { AiController } from "./ai.controller";
import { AiUseLogService } from "./ai-use-log.service";
import { CitationService } from "./citation.service";
import { ContextFilterService } from "./context-filter.service";
import { GeminiService } from "./gemini.service";

@Module({
  imports: [PolicyModule],
  controllers: [AiController],
  providers: [
    AiUseLogService,
    CitationService,
    ContextFilterService,
    GeminiService,
  ],
})
export class AiModule {}
