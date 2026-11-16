import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { getDb } from "../config/firebase";
import { HashChainService, GENESIS_HASH } from "./hash-chain.service";
import {
  CreateEntryDto,
  EditEntryDto,
  entryContentSchema,
} from "./dto";

@Injectable()
export class DiaryService {
  constructor(
    private readonly hashChain: HashChainService
  ) {}

  private ownerRef(uid: string) {
    return getDb().collection("users").doc(uid);
  }

  private entriesRef(uid: string) {
    return this.ownerRef(uid).collection("entries");
  }

  private versionsRef(uid: string) {
    return this.ownerRef(uid).collection("versions");
  }

  async createEntry(uid: string, dto: CreateEntryDto) {
    const db = getDb();
    const entryId = db.collection("ids").doc().id;

    const content = entryContentSchema.parse({
      ...dto,
      finalText: dto.originalText,
    });

    const version = 1;
    const previousHash = GENESIS_HASH;
    const entryHash = this.hashChain.createHash(
      previousHash,
      entryId,
      content.originalText,
      version
    );

    const now = new Date();

    const entryData = {
      ...content,
      finalText: content.originalText,
      isHidden: false,
      currentVersion: version,
      createdAt: now,
      updatedAt: now,
    };

    const versionData = {
      entryId,
      version,
      content,
      previousHash,
      entryHash,
      createdAt: now,
    };

    await this.entriesRef(uid).doc(entryId).set(entryData);
    await this.versionsRef(uid).doc(entryId).collection("versions").doc(String(version)).set(versionData);

    await this.ownerRef(uid).update({
      lastSeq: version,
      lastHash: entryHash,
    });

    return {
      id: entryId,
      ...entryData,
      entryHash,
    };
  }

  async listEntries(uid: string) {
    const snapshot = await this.entriesRef(uid)
      .where("isHidden", "==", false)
      .get();

    const entries = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    entries.sort((a: any, b: any) => {
      const dateA = `${a.entryDate} ${a.entryTime}`;
      const dateB = `${b.entryDate} ${b.entryTime}`;

      return dateB.localeCompare(dateA);
    });

    return { entries };
  }

  async getEntry(uid: string, entryId: string) {
    const snapshot = await this.entriesRef(uid).doc(entryId).get();

    if (!snapshot.exists) {
      throw new NotFoundException("Entry not found");
    }

    const entry = snapshot.data() as any;

    if (entry.isHidden) {
      throw new NotFoundException("Entry not found");
    }

    return {
      id: snapshot.id,
      ...entry,
    };
  }

  async editEntry(
    uid: string,
    entryId: string,
    dto: EditEntryDto
  ) {
    const entryRef = this.entriesRef(uid).doc(entryId);
    const snapshot = await entryRef.get();

    if (!snapshot.exists) {
      throw new NotFoundException("Entry not found");
    }

    const current = snapshot.data() as any;

    if (current.isHidden) {
      throw new NotFoundException("Entry not found");
    }

    if (current.isDraft) {
      throw new BadRequestException(
        "Publish the draft before editing it as a version"
      );
    }

    const nextVersion = current.currentVersion + 1;

    const updatedContent = {
      ...current,
      ...dto,
      finalText: dto.originalText ?? current.finalText,
    };

    const validated = entryContentSchema.parse(updatedContent);

    const previousHash = current.entryHash;

    const entryHash = this.hashChain.createHash(
      previousHash,
      entryId,
      validated.originalText,
      nextVersion
    );

    const now = new Date();

    const versionData = {
      entryId,
      version: nextVersion,
      content: validated,
      previousHash,
      entryHash,
      createdAt: now,
    };

    await this.versionsRef(uid)
      .doc(entryId)
      .collection("versions")
      .doc(String(nextVersion))
      .set(versionData);

    await entryRef.update({
      ...validated,
      currentVersion: nextVersion,
      updatedAt: now,
    });

    await this.ownerRef(uid).update({
      lastSeq: nextVersion,
      lastHash: entryHash,
    });

    return {
      id: entryId,
      ...validated,
      currentVersion: nextVersion,
      entryHash,
    };
  }

  async setFavorite(
    uid: string,
    entryId: string,
    isFavorite: boolean
  ) {
    const entryRef = this.entriesRef(uid).doc(entryId);
    const snapshot = await entryRef.get();

    if (!snapshot.exists) {
      throw new NotFoundException("Entry not found");
    }

    await entryRef.update({ isFavorite });

    return {
      id: entryId,
      isFavorite,
    };
  }

  async hideEntry(uid: string, entryId: string) {
    const entryRef = this.entriesRef(uid).doc(entryId);
    const snapshot = await entryRef.get();

    if (!snapshot.exists) {
      throw new NotFoundException("Entry not found");
    }

    await entryRef.update({ isHidden: true });

    return {
      id: entryId,
      isHidden: true,
    };
  }

  async listVersions(uid: string, entryId: string) {
    const snapshot = await this.versionsRef(uid)
      .doc(entryId)
      .collection("versions")
      .orderBy("version", "asc")
      .get();

    const versions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { versions };
  }
}