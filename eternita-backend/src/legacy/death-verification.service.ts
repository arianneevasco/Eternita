import { Injectable } from "@nestjs/common";
import { getFirestore } from "firebase-admin/firestore";

@Injectable()
export class DeathVerificationService {
  private db = getFirestore();

  async submitDeathReport(
    ownerUid: string,
    submittedByUid: string,
  ) {
    const reportReference = this.db
      .collection("users")
      .doc(ownerUid)
      .collection("deathReports")
      .doc();

    await reportReference.set({
      reportId: reportReference.id,
      ownerUid,
      submittedByUid,
      status: "pending",
      submittedAt: new Date(),
      verifiedAt: null,
      verifiedByUid: null
    });

    return {
      reportId: reportReference.id,
      status: "pending"
    };
  }

  async verifyDeathReport(
    ownerUid: string,
    reportId: string,
    verifiedByUid: string,
  ) {
    const reportReference = this.db
      .collection("users")
      .doc(ownerUid)
      .collection("deathReports")
      .doc(reportId);

    const now = new Date();

    await reportReference.update({
      status: "verified",
      verifiedAt: now,
      verifiedByUid
    });

    await this.db
      .collection("users")
      .doc(ownerUid)
      .update({
        deceased: true,
        deathVerifiedAt: now
      });

    await this.freezeActivePolicies(ownerUid);

    return {
      reportId,
      status: "verified"
    };
  }

  private async freezeActivePolicies(ownerUid: string) {
    const policies = await this.db
      .collection("users")
      .doc(ownerUid)
      .collection("policies")
      .where("status", "==", "active")
      .get();

    const batch = this.db.batch();

    policies.docs.forEach((document) => {
      batch.update(document.ref, {
        status: "frozen",
        frozenAt: new Date()
      });
    });

    await batch.commit();
  }
}