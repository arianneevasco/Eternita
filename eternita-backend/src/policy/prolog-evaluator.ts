// @ts-expect-error tau-prolog does not provide TypeScript declarations.
import pl from "tau-prolog";

export interface PolicyEvaluationInput {
  facts: string;
  query: string;
}

export interface PolicyEvaluationResult {
  allowed: boolean;
  error?: string;
}

export async function evaluatePolicy(
  input: PolicyEvaluationInput
): Promise<PolicyEvaluationResult> {
  return new Promise((resolve) => {
    const session = pl.create(1000);
    const program = `${input.facts}\naccess_allowed(Person, Entry, Access) :- grant(Person, Entry, Access).`;

    session.consult(program, {
      success: () => {
        session.query(input.query, {
          success: () => {
            session.answer({
              success: () => {
                resolve({ allowed: true });
              },
              fail: () => {
                resolve({ allowed: false });
              },
              error: (error: unknown) => {
                resolve({
                  allowed: false,
                  error: `Prolog evaluation failed: ${String(error)}`
                });
              }
            });
          },
          error: (error: unknown) => {
            resolve({
              allowed: false,
              error: `Invalid Prolog query: ${String(error)}`
            });
          }
        });
      },
      error: (error: unknown) => {
        resolve({
          allowed: false,
          error: `Invalid Prolog facts: ${String(error)}`
        });
      }
    });
  });
}
