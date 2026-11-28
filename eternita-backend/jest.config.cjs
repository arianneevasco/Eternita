/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  moduleFileExtensions: ["ts", "js", "json"],
  moduleNameMapper: { "^@nestjs/swagger$": "<rootDir>/test/swagger-jest-shim.ts" },
  testPathIgnorePatterns: ["/test/.*integration\\.test\\.ts$"],
};
