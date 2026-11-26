import { Module } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { FirebaseAuthService } from "../auth/firebase-auth.service";
import { LegacyController } from "./legacy.controller";
import { LegacyService } from "./legacy.service";

@Module({
  controllers: [LegacyController],
  providers: [LegacyService, AuthGuard, FirebaseAuthService],
  exports: [LegacyService],
})
export class LegacyModule {}
