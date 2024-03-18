import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadModule } from '@util/module';
import path from "path";
import { json } from 'body-parser';

import cookieParser from 'cookie-parser';
// somewhere in your initialization file

/**
 * 历史天坑
 */
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(
    await AppModule.registerDynamicModules(),
  );
  app.use(cookieParser());
  app.use(json({ limit: '50mb'}));
  await app.listen(3000);
}
bootstrap();
