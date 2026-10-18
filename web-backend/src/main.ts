import { NestFactory } from '@nestjs/core';
import { AppModule} from './app.module.js';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONT,
    credentials: true, 
  });
  app.use(cookieParser())
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }))
  app.use(express.urlencoded({
    limit:'20mb'
  }))
  await app.listen(process.env.PORT ?? 4001);
}
await bootstrap();
