import { describe, expect, it } from "@jest/globals";
import { evaluatePolicy } from "../../src/policy/prolog-evaluator";

describe("Prolog evaluator", () => {
  const facts = `
    person(ana).
    person(maria).

    entry(entry_1).
    entry_owner(entry_1, maria).

    protocol(ana).

    grant(ana, entry_1, summary).
  `;

  it("returns allowed: true for a valid grant", async () => {
    const result = await evaluatePolicy({
      facts,
      query: "access_allowed(ana, entry_1, summary).",
    });

    expect(result.allowed).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("returns allowed: false for a missing grant", async () => {
    const result = await evaluatePolicy({
      facts,
      query: "access_allowed(stranger, entry_1, full).",
    });

    expect(result.allowed).toBe(false);
  });

  it("returns allowed: false when Prolog facts are invalid", async () => {
    const result = await evaluatePolicy({
      facts: "this is not valid prolog :::",
      query: "access_allowed(ana, entry_1, summary).",
    });

    expect(result.allowed).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("returns allowed: false when the query is invalid", async () => {
    const result = await evaluatePolicy({
      facts,
      query: "this_is_not_a_valid_query(",
    });

    expect(result.allowed).toBe(false);
    expect(result.error).toBeDefined();
  });
});