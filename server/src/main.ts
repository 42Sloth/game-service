import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.use(
    session({
      secret: process.env.SECRET,
      resave: false,
      // httpOnly: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000,
        // httpOnly: false
      },
    })
  );

  app.use(passport.initialize()); // passport 구동
  app.use(passport.session()); // 세션 연결

  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });

  await app.listen(8000);
}
bootstrap();
