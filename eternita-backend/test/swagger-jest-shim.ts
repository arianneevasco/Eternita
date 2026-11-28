// Swagger's NestJS 12 package is ESM-only; unit tests run CommonJS via ts-jest.
// Keep metadata decorators inert in test runtime; production loads the real package.
const decorator = () => (..._args: unknown[]) => undefined;

export const ApiBearerAuth = decorator;
export const ApiBody = decorator;
export const ApiCreatedResponse = decorator;
export const ApiOperation = decorator;
export const ApiProperty = decorator;
export const ApiTags = decorator;
