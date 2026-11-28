import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

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
