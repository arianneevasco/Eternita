import { Module } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { FirebaseAuthService } from "../auth/firebase-auth.service";
import { PolicyController } from "./policy.controller";
import { PolicyStorageService } from "./policy-storage.service";
import { PolicyEvaluationService } from "./policy-evaluation.service";

@Module({
  controllers: [PolicyController],
  providers: [
    PolicyStorageService,
    PolicyEvaluationService,
    AuthGuard,
    FirebaseAuthService,
  ],
  exports: [PolicyStorageService, PolicyEvaluationService]
})
export class PolicyModule {}
