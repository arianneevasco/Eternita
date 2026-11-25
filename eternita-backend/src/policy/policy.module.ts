import { Module } from "@nestjs/common";
import { PolicyController } from "./policy.controller";
import { PolicyStorageService } from "./policy-storage.service";
import { PolicyEvaluationService } from "./policy-evaluation.service";

@Module({
  controllers: [PolicyController],
  providers: [PolicyStorageService, PolicyEvaluationService],
  exports: [PolicyStorageService, PolicyEvaluationService]
})
export class PolicyModule {}
