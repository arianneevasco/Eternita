import { calculateEntryHash } from "./hashChain";
import { TamperDetected } from "./types";
import type { ChainVerificationResult, StoredEntry } from "./types";

export class EntryStore {
  private entries: StoredEntry[] = [];
  private previousHash = "GENESIS";

  appendEntry(input: {
    id: string;
    title: string;
    originalText: string;
    correctedText: string;
  }): StoredEntry {
    const sequence = this.entries.length + 1;

    const entryWithoutHash = {
      id: input.id,
      sequence,
      previousHash: this.previousHash,
      title: input.title,
      originalText: input.originalText,
      correctedText: input.correctedText
    };

    const entryHash = calculateEntryHash(entryWithoutHash);

    const storedEntry: StoredEntry = {
      ...entryWithoutHash,
      entryHash
    };

    this.entries.push(storedEntry);
    this.previousHash = entryHash;

    return storedEntry;
  }

  getEntries(): readonly StoredEntry[] {
    return [...this.entries];
  }

  verify(): ChainVerificationResult {
    let expectedPreviousHash = "GENESIS";

    for (const entry of this.entries) {
      const recalculatedHash = calculateEntryHash({
        id: entry.id,
        sequence: entry.sequence,
        previousHash: entry.previousHash,
        title: entry.title,
        originalText: entry.originalText,
        correctedText: entry.correctedText
      });

      if (entry.previousHash !== expectedPreviousHash) {
        return {
          isValid: false,
          brokenAtSequence: entry.sequence,
          reason: `Broken link at entry ${entry.sequence}: previous hash does not match the expected previous hash.`
        };
      }

      if (entry.entryHash !== recalculatedHash) {
        return {
          isValid: false,
          brokenAtSequence: entry.sequence,
          reason: `Tampered entry detected at entry ${entry.sequence}: stored hash does not match recalculated hash.`
        };
      }

      expectedPreviousHash = entry.entryHash;
    }

    return {
      isValid: true,
      brokenAtSequence: null,
      reason: null
    };
  }

  verifyOrThrow(): void {
    const result = this.verify();

    if (!result.isValid) {
      throw new TamperDetected(result.reason ?? "Tamper detected.");
    }
  }
}