import { Module } from "@nestjs/common";
import { HealthController } from "./health/health.controller";
import { AccountController } from "./account/account.controller";
import { AuthGuard } from "./auth/auth.guard";
import { FirebaseAuthService } from "./auth/firebase-auth.service";
import { PeopleController } from "./people/people.controller";
import { DiaryModule } from "./diary/diary.module";


@Module({
  imports: [DiaryModule],
  controllers: [HealthController, AccountController, PeopleController],
  providers: [AuthGuard, FirebaseAuthService],
})
export class AppModule {}