import { Module } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { FirebaseAuthService } from "../auth/firebase-auth.service";
import { DiaryController } from "./diary.controller";
import { DiaryService } from "./diary.service";
import { HashChainService } from "./hash-chain.service";
import { PolicyModule } from "../policy/policy.module";
import { LegacyModule } from "../legacy/legacy.module";

@Module({
  imports: [PolicyModule, LegacyModule],
  controllers: [DiaryController],
  providers: [
    DiaryService,
    HashChainService,
    AuthGuard,
    FirebaseAuthService,
  ],
})
export class DiaryModule {}
