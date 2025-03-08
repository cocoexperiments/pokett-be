import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Add request logging middleware
  app.use((req: Request, res: Response, next: Function) => {
    const logger = new Logger('HTTP');
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logger.log(
        `${req.method} ${req.url} ${res.statusCode} - ${duration}ms`
      );
    });
    
    next();
  });

  const config = new DocumentBuilder()
    .setTitle('Pokett API')
    .setDescription(`The Pokett expense splitting application API documentation.`)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your Bearer token (session_token received from /auth/authenticate)',
        in: 'header',
      },
      'Bearer Token'
    )
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Application running on: http://localhost:${port}`);
}
bootstrap(); 