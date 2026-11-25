import { createHash } from "crypto";
import { parsePolicy } from "./parser";
import {
  PolicyProgram,
  WritingMode,
} from "./ast";

export interface CompiledPolicy {
  schemaVersion: 1;
  facts: string[];
  releases: {
    id: string;
    to: string;
    title: string;
    date: string;
  }[];
  custodyDeclarations: {
    to: string;
  }[];
  defaultMode: WritingMode;
}

const NAME =
  /^[a-z][a-z0-9_]{0,30}$/;

function checkedName(
  value: string,
  line: number
): string {
  if (!NAME.test(value)) {
    throw new Error(
      `Line ${line}: invalid identifier "${value}"`
    );
  }

  return value;
}

function letterId(title: string): string {
  const normalized = title.trim();

  if (!normalized) {
    throw new Error(
      "Letter title must not be empty"
    );
  }

  return createHash("sha256")
    .update(normalized, "utf8")
    .digest("hex");
}

export function compilePolicy(
  source: string
): CompiledPolicy {
  const program: PolicyProgram =
    parsePolicy(source);

  const facts: string[] = [];
  const releases: CompiledPolicy["releases"] = [];
  const custodyDeclarations:
    CompiledPolicy["custodyDeclarations"] = [];

  const releaseKeys = new Set<string>();

  let defaultMode: WritingMode | undefined;

  for (const protocol of program.protocols) {
    const viewer = checkedName(
      protocol.name,
      protocol.line
    );

    for (const statement of protocol.statements) {
      if (statement.type === "see") {
        const action = statement.kind;

        const topic =
          statement.by === "mentions"
            ? `mentions_${statement.value}`
            : `tag_${statement.value}`;

        const predicate = statement.allow
          ? "allow"
          : "deny";

        facts.push(
          `${predicate}(${viewer},${action},${topic}).`
        );
      }

      if (statement.type === "release") {
        const id = letterId(statement.title);
        const key = `${id}:${statement.to}`;

        if (releaseKeys.has(key)) {
          throw new Error(
            `Line ${statement.line}: duplicate release`
          );
        }

        releaseKeys.add(key);

        facts.push(
          `release(${id},${statement.to},date(${statement.on})).`
        );

        releases.push({
          id,
          to: statement.to,
          title: statement.title,
          date: statement.on,
        });
      }

      if (statement.type === "custody") {
        const recipient = checkedName(
          statement.to,
          statement.line
        );

        facts.push(`custody(${recipient}).`);

        custodyDeclarations.push({
          to: recipient,
        });
      }

      if (statement.type === "mode") {
        if (
          defaultMode &&
          defaultMode !== statement.mode
        ) {
          throw new Error(
            `Line ${statement.line}: conflicting writing modes`
          );
        }

        defaultMode = statement.mode;
      }
    }
  }

  return {
    schemaVersion: 1,
    facts,
    releases,
    custodyDeclarations,
    defaultMode: defaultMode ?? "verbatim",
  };
}
