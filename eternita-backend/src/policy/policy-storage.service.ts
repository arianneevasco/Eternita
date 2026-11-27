import { Injectable, NotFoundException } from "@nestjs/common";
import { getDb } from "../config/firebase";
import { compilePolicy } from "./compiler";
import { parsePolicy } from "./parser";

@Injectable()
export class PolicyStorageService {
  async savePolicy(ownerUid: string, policyText: string) {
    const db = getDb();
    const entriesSnapshot = await db
      .collection("users")
      .doc(ownerUid)
      .collection("entries")
      .get();
    const identityMap = await this.getPolicyIdentityMap(ownerUid, policyText);
    const compiled = compilePolicy(policyText, entriesSnapshot.docs.map((document) => ({
      entryId: document.id,
      people: (document.data().people as string[] | undefined) ?? [],
      tags: (document.data().tags as string[] | undefined) ?? [],
    })), identityMap);

    const policyReference = db
      .collection("users")
      .doc(ownerUid)
      .collection("policies")
      .doc();

    const now = new Date();

    const activePolicies = await policyReference.parent
      .where("status", "==", "active")
      .get();
    const batch = db.batch();

    for (const document of activePolicies.docs) {
      batch.update(document.ref, { status: "superseded", updatedAt: now });
    }

    batch.set(policyReference, {
      policyId: policyReference.id,
      ownerUid,
      policyText,
      compiledFacts: compiled.facts,
      compiledPolicy: compiled,
      version: 1,
      status: "active",
      createdAt: now,
      updatedAt: now
    });
    await batch.commit();

    return {
      policyId: policyReference.id,
      ownerUid,
      policyText,
      compiledFacts: compiled.facts,
      version: 1,
      status: "active"
    };
  }

  async getPolicyIdentityMap(ownerUid: string, policyText: string): Promise<Record<string, string>> {
    const protocolNames = parsePolicy(policyText).protocols.map((protocol) => protocol.name);
    const requestSnapshot = await getDb()
      .collection("users")
      .doc(ownerUid)
      .collection("legacyRequests")
      .get();

    const requesterUids = [...new Set(requestSnapshot.docs
      .map((document) => document.data().requesterUid)
      .filter((uid): uid is string => typeof uid === "string" && uid.length > 0))];
    const profiles = await Promise.all(requesterUids.map(async (requesterUid) => {
      const snapshot = await getDb().collection("users").doc(requesterUid).get();
      return { uid: requesterUid, data: snapshot.data() as { handle?: unknown } | undefined };
    }));

    return Object.fromEntries(protocolNames.flatMap((protocolName) => {
      const match = profiles.find((profile) => profile.data?.handle === protocolName);
      if (match) return [[protocolName, match.uid]];

      // Preserve compatibility with existing symbolic policies whose protocol
      // identity is already the requester UID.
      const directMatch = requesterUids.find((requesterUid) => requesterUid === protocolName);
      return directMatch ? [[protocolName, directMatch]] : [];
    }));
  }

  async getActivePolicy(ownerUid: string) {
    const snapshot = await getDb()
      .collection("users")
      .doc(ownerUid)
      .collection("policies")
      .where("status", "==", "active")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const document = snapshot.docs[0];

    return {
      policyId: document.id,
      ...document.data()
    };
  }

  async getLatestFrozenPolicy(ownerUid: string) {
    const snapshot = await getDb()
      .collection("users")
      .doc(ownerUid)
      .collection("policies")
      .where("status", "==", "frozen")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const document = snapshot.docs[0];
    return { policyId: document.id, ...document.data() };
  }

  async freezePolicy(ownerUid: string, policyId: string) {
    const policyReference = getDb()
      .collection("users")
      .doc(ownerUid)
      .collection("policies")
      .doc(policyId);
    const snapshot = await policyReference.get();

    if (!snapshot.exists) {
      throw new NotFoundException("Policy not found");
    }

    await policyReference.update({
        status: "frozen",
        frozenAt: new Date()
      });

    return { policyId, status: "frozen" };
  }
}
