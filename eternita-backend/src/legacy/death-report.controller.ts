import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { DeathVerificationService } from "./death-verification.service";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { ownerUidSchema, OwnerUidDto } from "./legacy.dto";
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";

@Controller("legacy")
@UseGuards(AuthGuard)
@ApiTags("Death reports")
@ApiBearerAuth()
export class DeathReportController {
  constructor(private readonly deathVerification: DeathVerificationService) {}

  @Post("death-reports")
  @ApiOperation({ summary: "Submit an eligible delayed death report" })
  @ApiBody({ schema: { type: "object", additionalProperties: false, required: ["ownerUid"], properties: { ownerUid: { type: "string", minLength: 1, maxLength: 128, example: "owner-uid" } } } })
  @ApiCreatedResponse({ schema: { example: { reportId: "report-id", status: "pending", confirmAfter: "2026-11-28T14:00:00.000Z" } } })
  @ApiBadRequestResponse({ description: "Invalid request data" })
  @ApiForbiddenResponse({ description: "An active legacy grant is required; response message is generic" })
  @ApiConflictResponse({ description: "An active report already exists or the owner is already deceased" })
  @ApiUnauthorizedResponse({ description: "Missing, invalid, or expired Firebase ID token" })
  submit(@Req() request: { uid: string }, @Body(new ZodValidationPipe(ownerUidSchema)) body: OwnerUidDto) {
    return this.deathVerification.submitDeathReport(body.ownerUid, request.uid);
  }
}
