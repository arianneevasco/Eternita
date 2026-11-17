import { compilePolicy } from "../src/policy/compiler";
import { expect, test } from "@jest/globals";

const policy = `
protocol maria:
  may see existence of entries mentioning maria
  may read summary of entries tagged family
  may not read summary of entries tagged health
  release letter To my daughter to maria when date 2040-05-01
  transfer custody to juan
  default writing mode verbatim
`;

test("compiles permissions and preserves deny rules", () => {
  const result = compilePolicy(policy);

  expect(result.facts).toContain(
    "allow(maria,existence,mentions_maria)."
  );

  expect(result.facts).toContain(
    "allow(maria,summary,tag_family)."
  );

  expect(result.facts).toContain(
    "deny(maria,summary,tag_health)."
  );

  expect(result.defaultMode).toBe("verbatim");
  expect(result.custodyDeclarations).toEqual([
    { to: "juan" },
  ]);
});
