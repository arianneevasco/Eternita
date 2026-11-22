import { describe, expect, it } from "@jest/globals";
import { Owner } from "../src/domain/Owner";
import { Beneficiary } from "../src/domain/Beneficiary";
import { Vault, VaultEntry } from "../src/domain/Vault";
import { Protocol } from "../src/domain/Protocol";
import { Grant } from "../src/domain/Grant";

describe("domain classes", () => {
  const owner = new Owner(
    "owner-1",
    "owner@example.com",
    "Owner"
  );

  const vault = new Vault("vault-1", owner.id);

  const beneficiary = new Beneficiary(
    "beneficiary-1",
    "maria",
    "Maria"
  );

  const protocol = new Protocol(
    "protocol-1",
    beneficiary.id,
    "Maria Protocol"
  );

  const familySummary = new Grant(
    "grant-1",
    "summary",
    { type: "tagged", value: "family" },
    "allow"
  );

  const healthDeny = new Grant(
    "grant-2",
    "summary",
    { type: "tagged", value: "health" },
    "deny"
  );

  const familyEntry: VaultEntry = {
    id: "entry-1",
    title: "Family day",
    content: "I spent time with my family.",
    tags: ["family"],
    mentionedPeople: [],
  };

  const healthEntry: VaultEntry = {
    id: "entry-2",
    title: "Health update",
    content: "I went to the doctor.",
    tags: ["health"],
    mentionedPeople: [],
  };

  it("allows an Owner to create and hold a Vault", () => {
    owner.createVault(vault);

    expect(owner.hasVault()).toBe(true);
    expect(owner.getVault()).toBe(vault);
  });

  it("allows a Beneficiary to hold a Protocol", () => {
    beneficiary.assignProtocol(protocol);

    expect(beneficiary.hasProtocol()).toBe(true);
    expect(beneficiary.getProtocol()).toBe(protocol);
  });

  it("allows a Protocol to hold Grants", () => {
    protocol.addGrant(familySummary);
    protocol.addGrant(healthDeny);

    expect(protocol.getGrants()).toHaveLength(2);
    expect(protocol.hasGrant(familySummary)).toBe(true);
    expect(protocol.hasGrant(healthDeny)).toBe(true);
  });

  it("prevents outside code from directly reading Vault entries", () => {
    const privateVault = vault as unknown as {
      entries?: VaultEntry[];
    };

    expect(privateVault.entries).toBeUndefined();
  });

  it("allows the Owner to add an entry through a Vault method", () => {
    vault.addEntry(familyEntry);
    vault.addEntry(healthEntry);

    expect(vault.getEntryCount()).toBe(2);
    expect(vault.getEntriesForOwner()).toHaveLength(2);
  });

  it("returns only permitted entries for a Beneficiary", () => {
    const permittedEntries = vault.getPermittedEntries(beneficiary);

    expect(permittedEntries).toHaveLength(1);
    expect(permittedEntries[0].id).toBe("entry-1");
  });

  it("denies entries when a deny grant matches", () => {
    const permittedEntries = vault.getPermittedEntries(beneficiary);

    expect(
      permittedEntries.some((entry) => entry.id === "entry-2")
    ).toBe(false);
  });

  it("prevents changes after the Vault is frozen", () => {
    const frozenVault = new Vault("vault-2", owner.id);
    frozenVault.freeze();

    expect(() =>
      frozenVault.addEntry(familyEntry)
    ).toThrow("Vault is frozen and cannot be changed");
  });

  it("prevents changes after the Protocol is frozen", () => {
    const frozenProtocol = new Protocol(
      "protocol-2",
      beneficiary.id,
      "Frozen Protocol"
    );

    frozenProtocol.freeze();

    expect(() =>
      frozenProtocol.addGrant(familySummary)
    ).toThrow("Protocol is frozen and cannot be changed");
  });

  it("rejects a Protocol assigned to another Beneficiary", () => {
    const otherBeneficiary = new Beneficiary(
      "beneficiary-2",
      "juan",
      "Juan"
    );

    expect(() =>
      otherBeneficiary.assignProtocol(protocol)
    ).toThrow("Protocol does not belong to this Beneficiary");
  });
});