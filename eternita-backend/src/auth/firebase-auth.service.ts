import { Injectable, UnauthorizedException } from "@nestjs/common";
import { getAuth } from "firebase-admin/auth";
import { initializeFirebase } from "../config/firebase";


@Injectable()
export class FirebaseAuthService {
  async verifyIdToken(authorizationHeader?: string): Promise<string> {
    if (!authorizationHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token");
    }

    const idToken = authorizationHeader
      .slice("Bearer ".length)
      .trim();

    try {
      initializeFirebase();
      const decoded = await getAuth().verifyIdToken(idToken, true);

      return decoded.uid;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}