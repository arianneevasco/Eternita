import { createHash } from "crypto";

export const GENESIS_HASH = "0".repeat(64);

export class HashChainService {
  createHash(
    previousHash: string,
    entryId: string,
    originalText: string,
    version: number
  ): string {
    const text = `${previousHash}${entryId}${originalText}${version}`;

    return createHash("sha256").update(text, "utf8").digest("hex");
  }
}