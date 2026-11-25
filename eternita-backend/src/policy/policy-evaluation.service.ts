import { Injectable } from "@nestjs/common";
import { PolicyStorageService } from "./policy-storage.service";
import { evaluatePolicy } from "./prolog-evaluator";
import { isReleaseDateReached } from "../diary/release-date";

export type AccessLevel = "existence" | "summary" | "full";

export interface AccessRequest {
  requesterUid: string;
  ownerUid: string;
  entryId: string;
  requestedAccess: AccessLevel;
  releaseDate?: string;
}

export interface AccessDecision {
  allowed: boolean;
  reason: string;
}

@Injectable()
export class PolicyEvaluationService {
  constructor(
    private readonly policyStorage: PolicyStorageService,
  ) {}

  async evaluateAccess(
    request: AccessRequest,
  ): Promise<AccessDecision> {
    if (!isReleaseDateReached(request.releaseDate)) {
      return {
        allowed: false,
        reason: "Entry is not available yet.",
      };
    }

    const policy = await this.policyStorage.getActivePolicy(
      request.ownerUid,
    );

    if (!policy) {
      return {
        allowed: false,
        reason: "No active policy is available for this owner.",
      };
    }

    const facts = (
      policy as typeof policy & { compiledFacts: string[] }
    ).compiledFacts.join("\n");

    const result = await evaluatePolicy({
      facts,
      query: `access_allowed(${request.requesterUid}, ${request.entryId}, ${request.requestedAccess}).`,
    });

    if (result.error) {
      return {
        allowed: false,
        reason: "Access could not be evaluated.",
      };
    }

    return {
      allowed: result.allowed,
      reason: result.allowed
        ? "Access granted by policy."
        : "Access denied by policy.",
    };
  }
}
