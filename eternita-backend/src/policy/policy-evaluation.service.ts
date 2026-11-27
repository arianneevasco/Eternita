import { Injectable } from "@nestjs/common";
import { PolicyStorageService } from "./policy-storage.service";
import { evaluatePolicy } from "./prolog-evaluator";
import { compilePolicy } from "./compiler";
import { isReleaseDateReached } from "../diary/release-date";

export type AccessLevel = "existence" | "summary" | "full";

export interface AccessRequest {
  requesterUid: string;
  ownerUid: string;
  entryId: string;
  requestedAccess: AccessLevel;
  releaseDate?: string;
  entry?: {
    entryId: string;
    people?: string[];
    tags?: string[];
  };
  allowFrozenPolicy?: boolean;
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
    const effectivePolicy = policy ?? (request.allowFrozenPolicy
      ? await this.policyStorage.getLatestFrozenPolicy(request.ownerUid)
      : null);

    if (!effectivePolicy) {
      return {
        allowed: false,
        reason: "No active policy is available for this owner.",
      };
    }

    try {
      const storedPolicy = effectivePolicy as typeof effectivePolicy & {
        policyText?: string;
        compiledFacts?: string[];
      };
      const facts = request.entry && typeof storedPolicy.policyText === "string"
        ? compilePolicy(storedPolicy.policyText, [request.entry]).facts.join("\n")
        : (storedPolicy.compiledFacts ?? []).join("\n");

      const atom = (value: string) =>
        /^[a-z][a-zA-Z0-9_]*$/.test(value)
          ? value
          : `'${value.replace(/'/g, "''")}'`;

      const result = await evaluatePolicy({
        facts,
        query: `access_allowed(${atom(request.requesterUid)}, ${atom(request.entryId)}, ${request.requestedAccess}).`,
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
    } catch {
      return {
        allowed: false,
        reason: "Access could not be evaluated.",
      };
    }
  }
}
