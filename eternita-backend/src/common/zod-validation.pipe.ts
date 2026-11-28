import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from "@nestjs/common";
import { ZodSchema } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(
    private readonly schema: ZodSchema
  ) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type !== "body" && metadata.type !== "query") {
      return value;
    }

    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException({
        message: "Invalid request data",
        errors: {
          ...result.error.flatten().fieldErrors,
          ...(result.error.flatten().formErrors.length
            ? { _request: result.error.flatten().formErrors }
            : {}),
        },
      });
    }

    return result.data;
  }
}
