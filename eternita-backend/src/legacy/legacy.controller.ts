import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { LegacyService } from "./legacy.service";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { ownerUidSchema, OwnerUidDto } from "./legacy.dto";
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";

@Controller("legacy")
@UseGuards(AuthGuard)
@ApiTags("Legacy access")
@ApiBearerAuth()
export class LegacyController {
  constructor(private readonly legacyService: LegacyService) {}

  @Post("request")
  @ApiOperation({ summary: "Request access to an owner's legacy records" })
  @ApiBody({ schema: { type: "object", additionalProperties: false, required: ["ownerUid"], properties: { ownerUid: { type: "string", minLength: 1, maxLength: 128, example: "owner-uid" } } } })
  @ApiCreatedResponse({ schema: { example: { requestId: "request-123", status: "pending", decision: null, decisionAt: null, activatedAt: null, revokedAt: null, createdAt: "2026-11-28T10:30:00.000Z", updatedAt: "2026-11-28T10:30:00.000Z" } } })
  @ApiBadRequestResponse({ description: "Invalid request data" })
  @ApiUnauthorizedResponse({ description: "Missing, invalid, or expired Firebase ID token" })
  async requestAccess(
    @Req() request: { uid: string },
    @Body(new ZodValidationPipe(ownerUidSchema)) body: OwnerUidDto,
  ) {
    return this.legacyService.requestLegacyAccess(
      body.ownerUid,
      request.uid,
    );
  }

  @Get("status/:ownerUid")
  @ApiOperation({ summary: "Get the authenticated requester's legacy access status" })
  @ApiResponse({ status: 200, description: "Safe request state or not_requested" })
  async getStatus(
    @Req() request: { uid: string },
    @Param("ownerUid") ownerUid: string,
  ) {
    return this.legacyService.getLegacyRequestStatus(
      ownerUid,
      request.uid,
    );
  }

  @Post("requests/:requestId/approve")
  @ApiOperation({ summary: "Approve a pending legacy request" })
  approve(@Req() request: { uid: string }, @Param("requestId") requestId: string) {
    return this.legacyService.approveLegacyRequest(requestId, request.uid);
  }

  @Post("requests/:requestId/deny")
  @ApiOperation({ summary: "Deny a pending legacy request" })
  deny(@Req() request: { uid: string }, @Param("requestId") requestId: string) {
    return this.legacyService.denyLegacyRequest(requestId, request.uid);
  }

  @Post("requests/:requestId/activate")
  @ApiOperation({ summary: "Activate an approved legacy request" })
  activate(@Req() request: { uid: string }, @Param("requestId") requestId: string) {
    return this.legacyService.activateLegacyRequest(requestId, request.uid);
  }

  @Post("requests/:requestId/revoke")
  @ApiOperation({ summary: "Revoke a legacy request" })
  revoke(@Req() request: { uid: string }, @Param("requestId") requestId: string) {
    return this.legacyService.revokeLegacyRequest(requestId, request.uid);
  }

  @Post("requests/:requestId/cancel")
  @ApiOperation({ summary: "Cancel a pending legacy request" })
  cancel(@Req() request: { uid: string }, @Param("requestId") requestId: string) {
    return this.legacyService.cancelLegacyRequest(requestId, request.uid);
  }
}
