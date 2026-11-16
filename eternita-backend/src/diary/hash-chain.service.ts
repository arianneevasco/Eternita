import { createHash } from "crypto";
import { Injectable } from "@nestjs/common";

export const GENESIS_HASH = "0".repeat(64);

@Injectable()
export class HashChainService {
  createHash(
    previousHash: string,
    entryId: string,
    body: string,
    version: number
  ): string {
    const text = `${previousHash}${entryId}${body}${version}`;

    return createHash("sha256").update(text, "utf8").digest("hex");
  }
}