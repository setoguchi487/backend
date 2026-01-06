import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT ?? 8000);
  const port = process.env.PORT || 8000;

  console.log('linstening on port ${port}');
  await app.listen(port, '0.0.0.0');

  app.enableCors({
  origin: [
    'http://localhost:5173',
    'https://https://frontend-0by4.onrender.com',
  ],
  credentials: true,
});
}
bootstrap();