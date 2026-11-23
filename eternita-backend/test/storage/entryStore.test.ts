import { EntryStore } from "../../src/storage/entryStore";
import { TamperDetected } from "../../src/storage/types";
import { describe, expect, test } from "@jest/globals";

describe("EntryStore", () => {
  test("appends entries and creates a valid hash chain", () => {
    const store = new EntryStore();

    store.appendEntry({
      id: "entry-1",
      title: "Family Trip",
      originalText: "Maria visited Baguio.",
      correctedText: "Maria visited Baguio."
    });

    store.appendEntry({
      id: "entry-2",
      title: "Birthday Memories",
      originalText: "We celebrated Ana's birthday.",
      correctedText: "We celebrated Ana's birthday."
    });

    const result = store.verify();

    expect(result.isValid).toBe(true);
    expect(result.brokenAtSequence).toBeNull();
    expect(result.reason).toBeNull();
  });

  test("links each entry to the previous hash", () => {
    const store = new EntryStore();

    const first = store.appendEntry({
      id: "entry-1",
      title: "First Entry",
      originalText: "First entry text.",
      correctedText: "First entry text."
    });

    const second = store.appendEntry({
      id: "entry-2",
      title: "Second Entry",
      originalText: "Second entry text.",
      correctedText: "Second entry text."
    });

    expect(first.previousHash).toBe("GENESIS");
    expect(second.previousHash).toBe(first.entryHash);
  });

  test("does not provide an edit or delete operation", () => {
    const store = new EntryStore();

    expect((store as unknown as Record<string, unknown>).editEntry).toBeUndefined();
    expect((store as unknown as Record<string, unknown>).deleteEntry).toBeUndefined();
  });
});
