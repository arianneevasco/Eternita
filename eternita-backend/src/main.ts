import { NestFactory } from "@nestjs/core";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { HttpExceptionFilter } from "./common/http-exception.filter";

const LOCAL_EXPO_ORIGINS = ["http://localhost:8081", "http://localhost:19006"];

export function getCorsAllowedOrigins(environment: NodeJS.ProcessEnv = process.env): string[] {
  const configured = environment.CORS_ALLOWED_ORIGINS;
  const candidates = configured === undefined
    ? (environment.APP_ENV?.toLowerCase() === "production" ? [] : LOCAL_EXPO_ORIGINS)
    : configured.split(",").map((origin) => origin.trim()).filter(Boolean);

  return [...new Set(candidates.filter((origin) => {
    if (origin === "*") return false;
    try {
      const parsed = new URL(origin);
      return (parsed.protocol === "http:" || parsed.protocol === "https:")
        && parsed.origin === origin;
    } catch {
      return false;
    }
  }))];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (validationErrors) => new BadRequestException({
        message: "Invalid request data",
        errors: Object.fromEntries(validationErrors.map((error) => [
          error.property,
          Object.values(error.constraints ?? {}),
        ])),
      }),
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const allowedOrigins = getCorsAllowedOrigins();
  app.enableCors({
    origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(null, false);
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
  });

  const openApiConfig = new DocumentBuilder()
    .setTitle("Eternita / Alaala Backend API")
    .setDescription("Authenticated API for diary, policy, legacy access, and grounded AI features.")
    .setVersion("1.0.0")
    .addBearerAuth()
    .build();
  const openApiDocument = SwaggerModule.createDocument(app, openApiConfig);
  SwaggerModule.setup("api", app, openApiDocument, { jsonDocumentUrl: "api-json" });

  const port = process.env.PORT ?? 3000;

  await app.listen(port);

  console.log(`Eternita backend is running on port ${port}`);
}

bootstrap();
