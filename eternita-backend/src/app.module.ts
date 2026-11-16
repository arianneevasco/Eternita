import { Module } from "@nestjs/common";
import { HealthController } from "./health/health.controller";
import { AccountController } from "./account/account.controller";
import { AuthGuard } from "./auth/auth.guard";
import { FirebaseAuthService } from "./auth/firebase-auth.service";


@Module({
  controllers: [HealthController, AccountController],
  providers: [AuthGuard, FirebaseAuthService],
})
export class AppModule {}