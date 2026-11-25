import { Module } from "@nestjs/common";
import { HealthController } from "./health/health.controller";
import { AccountController } from "./account/account.controller";
import { AuthGuard } from "./auth/auth.guard";
import { FirebaseAuthService } from "./auth/firebase-auth.service";
import { PeopleController } from "./people/people.controller";
import { DiaryModule } from "./diary/diary.module";
import { PolicyModule } from "./policy/policy.module";
import { AiModule } from "./ai/ai.module";


@Module({
  imports: [DiaryModule, PolicyModule, AiModule],
  controllers: [HealthController, AccountController, PeopleController],
  providers: [AuthGuard, FirebaseAuthService],
})
export class AppModule {}
