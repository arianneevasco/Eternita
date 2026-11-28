import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
interface HttpResponse {
  status(code: number): { json(body: ErrorBody): void };
}

type ErrorBody = {
  statusCode: number;
  code: string;
  message: string;
  errors?: Record<string, string[]>;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<HttpResponse>();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = exception instanceof HttpException ? exception.getResponse() : undefined;

    response.status(status).json(this.normalize(status, body));
  }

  private normalize(status: number, body: unknown): ErrorBody {
    if (status === HttpStatus.BAD_REQUEST) {
      const payload = body && typeof body === "object" ? body as Record<string, unknown> : {};
      const rawErrors = payload.errors && typeof payload.errors === "object"
        ? payload.errors as Record<string, unknown>
        : undefined;
      const errors = rawErrors
        ? Object.fromEntries(Object.entries(rawErrors).map(([key, value]) => [
            key,
            Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [],
          ]))
        : undefined;
      const suppliedMessage = typeof payload.message === "string" ? payload.message : "";
      return {
        statusCode: status,
        code: "VALIDATION_ERROR",
        message: suppliedMessage === "The email or password is invalid."
          ? suppliedMessage
          : "Invalid request data",
        ...(errors && Object.keys(errors).length ? { errors } : {}),
      };
    }

    const responseByStatus: Record<number, Pick<ErrorBody, "code" | "message">> = {
      [HttpStatus.UNAUTHORIZED]: {
        code: "UNAUTHORIZED",
        message: "Missing, invalid, or expired Firebase ID token.",
      },
      [HttpStatus.FORBIDDEN]: {
        code: "FORBIDDEN",
        message: "You are not authorized to perform this action.",
      },
      [HttpStatus.NOT_FOUND]: {
        code: "NOT_FOUND",
        message: "The requested resource was not found.",
      },
      [HttpStatus.CONFLICT]: {
        code: "CONFLICT",
        message: "The request conflicts with the current resource state.",
      },
    };
    const normalized = responseByStatus[status];
    if (normalized) return { statusCode: status, ...normalized };

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
    };
  }
}
