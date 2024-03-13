import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadModule } from '@util/module';
import path from "path";

async function bootstrap() {
  const app = await NestFactory.create(
    await AppModule.registerDynamicModules(),
  );
  await app.listen(3000);
}
bootstrap();
