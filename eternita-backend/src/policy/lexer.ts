import { PolicySyntaxError } from "./errors";

export type TokenType =
  | "WORD"
  | "STRING"
  | "DATE"
  | "COLON"
  | "END";

export interface Token {
  kind: TokenType;
  value: string;
  line: number;
}

const MAX_POLICY_LENGTH = 20000;

export function tokenize(source: string): Token[] {
  if (source.length > MAX_POLICY_LENGTH) {
    throw new PolicySyntaxError(
      `Policy exceeds ${MAX_POLICY_LENGTH} characters`,
      1
    );
  }

  const tokens: Token[] = [];
  let index = 0;
  let line = 1;

  while (index < source.length) {
    const character = source[index];

    if (character === "\n") {
      line++;
      index++;
      continue;
    }

    if (/\s/.test(character)) {
      index++;
      continue;
    }

    if (character === "#") {
      while (index < source.length && source[index] !== "\n") {
        index++;
      }
      continue;
    }

    if (character === ":") {
      tokens.push({
        kind: "COLON",
        value: ":",
        line,
      });
      index++;
      continue;
    }

    if (character === '"') {
      const start = index + 1;
      let end = start;

      while (
        end < source.length &&
        source[end] !== '"'
      ) {
        end++;
      }

      if (end >= source.length) {
        throw new PolicySyntaxError(
          "Unterminated string",
          line
        );
      }

      const value = source.slice(start, end);

      if (!value.trim()) {
        throw new PolicySyntaxError(
          "Quoted text must not be empty",
          line
        );
      }

      tokens.push({
        kind: "STRING",
        value,
        line,
      });

      index = end + 1;
      continue;
    }

    if (/[0-9]/.test(character)) {
      const start = index;

      while (
        index < source.length &&
        /[0-9-]/.test(source[index])
      ) {
        index++;
      }

      const value = source.slice(start, index);

      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new PolicySyntaxError(
          `Invalid date: ${value}`,
          line
        );
      }

      tokens.push({
        kind: "DATE",
        value,
        line,
      });

      continue;
    }

    if (/[a-zA-Z_]/.test(character)) {
      const start = index;

      while (
        index < source.length &&
        /[a-zA-Z0-9_]/.test(source[index])
      ) {
        index++;
      }

      const value = source
        .slice(start, index)
        .toLowerCase();

      tokens.push({
        kind: "WORD",
        value,
        line,
      });

      continue;
    }

    throw new PolicySyntaxError(
      `Unexpected character: ${character}`,
      line
    );
  }

  tokens.push({
    kind: "END",
    value: "",
    line,
  });

  return tokens;
}