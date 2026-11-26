import { Module } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { FirebaseAuthService } from "../auth/firebase-auth.service";
import { PolicyModule } from "../policy/policy.module";
import { AiController } from "./ai.controller";
import { AiUseLogService } from "./ai-use-log.service";
import { CitationService } from "./citation.service";
import { ContextFilterService } from "./context-filter.service";
import { GeminiService } from "./gemini.service";
import { LegacyModule } from "../legacy/legacy.module";

@Module({
  imports: [PolicyModule, LegacyModule],
  controllers: [AiController],
  providers: [
    AiUseLogService,
    CitationService,
    ContextFilterService,
    GeminiService,
    AuthGuard,
    FirebaseAuthService,
  ],
})
export class AiModule {}
