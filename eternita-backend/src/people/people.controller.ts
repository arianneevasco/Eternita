import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { getDb } from "../config/firebase";
import { AuthGuard } from "../auth/auth.guard";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { createInviteSchema, CreateInviteDto, joinInviteSchema, JoinInviteDto } from "./people.dto";
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";

@Controller()
@UseGuards(AuthGuard)
@ApiTags("People and invitations")
@ApiBearerAuth()
export class PeopleController {
  @Post("invites")
  @ApiOperation({ summary: "Create a beneficiary invitation" })
  @ApiBody({ schema: { type: "object", additionalProperties: false, required: ["handle", "name"], properties: { handle: { type: "string", minLength: 1, maxLength: 100, example: "maria_santos" }, name: { type: "string", minLength: 1, maxLength: 100, example: "Maria Santos" } } } })
  @ApiCreatedResponse({ schema: { example: { inviteId: "invite-123", code: "A1B2C3", handle: "maria_santos", name: "Maria Santos", expiresAt: "2026-12-05T10:30:00.000Z" } } })
  @ApiBadRequestResponse({ description: "Invalid request data", schema: { example: { statusCode: 400, code: "VALIDATION_ERROR", message: "Invalid request data", errors: { handle: ["Too small: expected string to have >=1 characters"] } } } })
  @ApiUnauthorizedResponse({ description: "Missing, invalid, or expired Firebase ID token" })
  async createInvite(
    @Req() request: any,
    @Body(new ZodValidationPipe(createInviteSchema)) body: CreateInviteDto
  ) {
    const db = getDb();
    const ownerUid = request.uid;

    const code = Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase();

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    const inviteRef = await db
      .collection("invites")
      .add({
        ownerUid,
        code,
        handle: body.handle,
        name: body.name,
        status: "pending",
        createdAt: new Date(),
        expiresAt,
      });

    return {
      inviteId: inviteRef.id,
      code,
      handle: body.handle,
      name: body.name,
      expiresAt,
    };
  }

  @Post("auth/join")
  @ApiOperation({ summary: "Join using an invitation code" })
  @ApiBody({ schema: { type: "object", additionalProperties: false, required: ["code", "name"], properties: { code: { type: "string", pattern: "^[A-Z0-9-]{6,64}$", example: "A1B2C3" }, name: { type: "string", minLength: 1, maxLength: 100, example: "Maria Santos" } } } })
  @ApiCreatedResponse({ schema: { example: { uid: "firebase-uid", role: "recipient", ownerUid: "owner-uid", name: "Maria Santos", handle: "maria_santos" } } })
  @ApiBadRequestResponse({ description: "Invalid request data" })
  @ApiUnauthorizedResponse({ description: "Missing, invalid, or expired Firebase ID token" })
  async join(
    @Req() request: any,
    @Body(new ZodValidationPipe(joinInviteSchema)) body: JoinInviteDto
  ) {
    const db = getDb();
    const uid = request.uid;

    return db.runTransaction(async (transaction) => {
      const invites = await transaction.get(
        db
          .collection("invites")
          .where("code", "==", body.code)
          .where("status", "==", "pending")
          .limit(1),
      );

      if (invites.empty) {
        return {
          error: "Invalid or already used invitation code",
        };
      }

      const invite = invites.docs[0];
      const inviteData = invite.data();
      const now = new Date();
      const expiresAt = typeof inviteData.expiresAt?.toDate === "function"
        ? inviteData.expiresAt.toDate()
        : new Date(inviteData.expiresAt);

      if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= now.getTime()) {
        return {
          error: "Invitation expired",
        };
      }

      const userRef = db.collection("users").doc(uid);
      const userSnapshot = await transaction.get(userRef);

      if (userSnapshot.exists) {
        return {
          error: "This account already has an Alaala profile",
        };
      }

      transaction.create(userRef, {
        role: "recipient",
        ownerUid: inviteData.ownerUid,
        name: body.name,
        handle: inviteData.handle,
        deceased: false,
        settings: {
          reminderTime: "20:00",
          autoLockMinutes: 5,
          darkMode: false,
        },
        createdAt: now,
      });

      transaction.update(invite.ref, {
        status: "used",
        usedByUid: uid,
        usedAt: now,
      });

      return {
        uid,
        role: "recipient",
        ownerUid: inviteData.ownerUid,
        name: body.name,
        handle: inviteData.handle,
      };
    });
  }

  @Get("people")
  @ApiOperation({ summary: "List trusted people associated with the owner" })
  @ApiResponse({ status: 200, schema: { example: { people: [{ uid: "recipient-uid", role: "recipient", ownerUid: "owner-uid", name: "Maria Santos", handle: "maria_santos" }] } } })
  @ApiUnauthorizedResponse({ description: "Missing, invalid, or expired Firebase ID token" })
  async getPeople(@Req() request: any) {
    const db = getDb();
    const ownerUid = request.uid;

    const snapshot = await db
      .collection("users")
      .where("ownerUid", "==", ownerUid)
      .get();

    const people = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: doc.id,
        role: data.role,
        ownerUid: data.ownerUid,
        name: data.name,
        handle: data.handle,
      };
    });

    return { people };
  }
}
