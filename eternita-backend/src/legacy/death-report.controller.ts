import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { DeathVerificationService } from "./death-verification.service";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

@Controller("legacy")
@UseGuards(AuthGuard)
@ApiTags("Death reports")
@ApiBearerAuth()
export class DeathReportController {
  constructor(private readonly deathVerification: DeathVerificationService) {}

  @Post("death-reports")
  @ApiOperation({ summary: "Submit an eligible delayed death report" })
  @ApiBody({ schema: { type: "object", required: ["ownerUid"], properties: { ownerUid: { type: "string" } } } })
  @ApiCreatedResponse({ schema: { example: { reportId: "report-id", status: "pending", confirmAfter: "2026-11-28T14:00:00.000Z" } } })
  submit(@Req() request: { uid: string }, @Body() body: { ownerUid: string }) {
    return this.deathVerification.submitDeathReport(body.ownerUid, request.uid);
  }
}
