import { Injectable } from "@nestjs/common";
import { getFirestore } from "firebase-admin/firestore";

@Injectable()
export class LegacyService {
  private db = getFirestore();

  async requestLegacyAccess(
    ownerUid: string,
    requesterUid: string,
  ) {
    const requestReference = this.db
      .collection("users")
      .doc(ownerUid)
      .collection("legacyRequests")
      .doc();

    await requestReference.set({
      requestId: requestReference.id,
      ownerUid,
      requesterUid,
      status: "pending",
      requestedAt: new Date(),
      decision: null
    });

    return {
      requestId: requestReference.id,
      status: "pending"
    };
  }

  async getLegacyRequestStatus(
    ownerUid: string,
    requesterUid: string,
  ) {
    const snapshot = await this.db
      .collection("users")
      .doc(ownerUid)
      .collection("legacyRequests")
      .where("requesterUid", "==", requesterUid)
      .orderBy("requestedAt", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) {
      return {
        status: "not_requested"
      };
    }

    return snapshot.docs[0].data();
  }
}