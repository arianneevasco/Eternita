import { Injectable } from "@nestjs/common";
import { PolicyEvaluationService } from "../policy/policy-evaluation.service";

@Injectable()
export class ContextFilterService {
  constructor(
    private readonly policyEvaluation: PolicyEvaluationService,
  ) {}

  async filterEntries(
    requesterUid: string,
    ownerUid: string,
    entries: any[],
  ) {
    const permitted = [];

    for (const entry of entries) {
      const decision = await this.policyEvaluation.evaluateAccess({
        requesterUid,
        ownerUid,
        entryId: entry.id,
        requestedAccess: "summary",
      });

      if (decision.allowed) {
        permitted.push({
          entryId: entry.id,
          title: entry.title,
          summary: entry.summary,
          entryDate: entry.entryDate
        });
      }
    }

    return permitted;
  }
}