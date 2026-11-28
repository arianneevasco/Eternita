// Swagger's NestJS 12 package is ESM-only; unit tests run CommonJS via ts-jest.
// Keep metadata decorators inert in test runtime; production loads the real package.
const decorator = () => (..._args: unknown[]) => undefined;

export const ApiBearerAuth = decorator;
export const ApiBadRequestResponse = decorator;
export const ApiBody = decorator;
export const ApiConflictResponse = decorator;
export const ApiCreatedResponse = decorator;
export const ApiForbiddenResponse = decorator;
export const ApiOperation = decorator;
export const ApiProperty = decorator;
export const ApiQuery = decorator;
export const ApiResponse = decorator;
export const ApiTags = decorator;
export const ApiUnauthorizedResponse = decorator;
