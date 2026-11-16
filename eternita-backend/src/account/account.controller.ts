import {Body,Controller,Get,Post,Req,UseGuards,
} from "@nestjs/common";
import { getDb } from "../config/firebase";
import { AuthGuard } from "../auth/auth.guard";

interface RegisterOwnerDto {
  name: string;
  handle: string;
}

@Controller("auth")
@UseGuards(AuthGuard)
export class AccountController {
  @Post("register-owner")
  async registerOwner(
    @Req() request: any,
    @Body() body: RegisterOwnerDto
  ) {
    const db = getDb();
    const uid = request.uid;

    const userRef = db.collection("users").doc(uid);
    const snapshot = await userRef.get();

    if (snapshot.exists) {
      return {
        error: "Profile already exists",
      };
    }

    const now = new Date();

    await userRef.set({
      role: "owner",
      name: body.name,
      handle: body.handle,
      deceased: false,
      settings: {
        reminderTime: "20:00",
        autoLockMinutes: 5,
        darkMode: false,
      },
      lastSeq: 0,
      lastHash: "0".repeat(64),
      createdAt: now,
    });

    await userRef.collection("activity").add({
      action: "registerOwner",
      at: now,
    });

    return {
      uid,
      role: "owner",
      name: body.name,
      handle: body.handle,
    };
  }

  @Get("me")
  async me(@Req() request: any) {
    const db = getDb();
    const uid = request.uid;

    const snapshot = await db.collection("users").doc(uid).get();

    if (!snapshot.exists) {
      return {
        error: "Register an Alaala profile first",
      };
    }

    const profile = snapshot.data();

    return {
      uid,
      role: profile?.role,
      name: profile?.name,
      handle: profile?.handle,
      settings: profile?.settings,
    };
  }
}