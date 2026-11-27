import { Module } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { FirebaseAuthService } from "../auth/firebase-auth.service";
import { LegacyController } from "./legacy.controller";
import { LegacyService } from "./legacy.service";
import { DeathReportController } from "./death-report.controller";
import { DeathVerificationService } from "./death-verification.service";
import { getDb } from "../config/firebase";

@Module({
  controllers: [LegacyController, DeathReportController],
  providers: [
    LegacyService,
    { provide: DeathVerificationService, useFactory: () => new DeathVerificationService(getDb()) },
    AuthGuard,
    FirebaseAuthService,
  ],
  exports: [LegacyService],
})
export class LegacyModule {}
