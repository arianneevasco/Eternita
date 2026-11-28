import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { LegacyService } from "./legacy.service";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

@Controller("legacy")
@UseGuards(AuthGuard)
@ApiTags("Legacy access")
@ApiBearerAuth()
export class LegacyController {
  constructor(private readonly legacyService: LegacyService) {}

  @Post("request")
  @ApiOperation({ summary: "Request access to an owner's legacy records" })
  @ApiBody({ schema: { type: "object", required: ["ownerUid"], properties: { ownerUid: { type: "string" } } } })
  @ApiCreatedResponse({ description: "Safe legacy request fields" })
  async requestAccess(
    @Req() request: { uid: string },
    @Body() body: { ownerUid: string },
  ) {
    return this.legacyService.requestLegacyAccess(
      body.ownerUid,
      request.uid,
    );
  }

  @Get("status/:ownerUid")
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
  approve(@Req() request: { uid: string }, @Param("requestId") requestId: string) {
    return this.legacyService.approveLegacyRequest(requestId, request.uid);
  }

  @Post("requests/:requestId/deny")
  deny(@Req() request: { uid: string }, @Param("requestId") requestId: string) {
    return this.legacyService.denyLegacyRequest(requestId, request.uid);
  }

  @Post("requests/:requestId/activate")
  activate(@Req() request: { uid: string }, @Param("requestId") requestId: string) {
    return this.legacyService.activateLegacyRequest(requestId, request.uid);
  }

  @Post("requests/:requestId/revoke")
  revoke(@Req() request: { uid: string }, @Param("requestId") requestId: string) {
    return this.legacyService.revokeLegacyRequest(requestId, request.uid);
  }

  @Post("requests/:requestId/cancel")
  cancel(@Req() request: { uid: string }, @Param("requestId") requestId: string) {
    return this.legacyService.cancelLegacyRequest(requestId, request.uid);
  }
}
