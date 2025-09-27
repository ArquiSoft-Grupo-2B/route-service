import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar validation pipe global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configurar CORS si es necesario
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  // Configuración de Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Routes API')
    .setDescription('API REST para gestión de rutas geoespaciales')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Token JWT de Firebase Authentication',
        in: 'header',
      },
      'firebase-auth', // Nombre del esquema de seguridad
    )
    .addTag('routes', 'Operaciones CRUD de rutas')
    .addTag('search', 'Búsqueda y filtrado de rutas')
    .addServer('http://localhost:3000', 'Servidor de desarrollo')
    .addServer('https://api.routes.com', 'Servidor de producción')
    .setContact(
      'Equipo Backend',
      'https://github.com/ArquiSoft-Grupo-2B/route-service',
      'backend@routes.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Montar la documentación en /api/docs
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Mantener autorización entre recargas
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Routes API Documentation',
    customfavIcon: '/favicon.ico',
    customJs: '/custom.js',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Aplicación corriendo en: http://localhost:${port}`);
  console.log(`📚 Documentación API: http://localhost:${port}/api/docs`);
}
bootstrap();
