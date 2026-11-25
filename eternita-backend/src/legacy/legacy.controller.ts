import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { LegacyService } from "./legacy.service";

@Controller("legacy")
@UseGuards(AuthGuard)
export class LegacyController {
  constructor(private readonly legacyService: LegacyService) {}

  @Post("request")
  async requestAccess(
    @Body() body: { ownerUid: string },
  ) {
    const requesterUid = "current-user-uid";

    return this.legacyService.requestLegacyAccess(
      body.ownerUid,
      requesterUid,
    );
  }

  @Get("status/:ownerUid")
  async getStatus(
    @Param("ownerUid") ownerUid: string,
  ) {
    const requesterUid = "current-user-uid";

    return this.legacyService.getLegacyRequestStatus(
      ownerUid,
      requesterUid,
    );
  }
}