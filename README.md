# Routes API

Aplicación NestJS con TypeORM y PostgreSQL, configurada con Docker para desarrollo local.

## 🚀 Inicio Rápido

### Opción 1: Desarrollo con Docker (Recomendado)

```bash
# 1. Levantar base de datos PostgreSQL
npm run docker:dev

# 2. Instalar dependencias
npm install

# 3. Ejecutar aplicación en modo desarrollo
npm run start:dev
```

### Opción 2: Aplicación completa en Docker

```bash
# Levantar toda la aplicación en contenedores
npm run docker:full
```

## 📋 Requisitos

- Node.js 18+
- Docker y Docker Compose
- npm o pnpm

## 🗄️ Base de Datos

La aplicación usa PostgreSQL con las siguientes credenciales por defecto:

```
Host: localhost
Puerto: 5432
Base de datos: routes_db
Usuario: routes_user
Contraseña: routes_password
```

## 🔧 Scripts Disponibles

### Desarrollo

```bash
npm run start:dev      # Ejecutar en modo desarrollo
npm run start:debug    # Ejecutar con debug
npm run build          # Construir aplicación
```

### Docker

```bash
npm run docker:dev        # Solo base de datos
npm run docker:dev:stop   # Detener base de datos
npm run docker:full       # Aplicación completa
npm run docker:full:stop  # Detener todo
npm run docker:logs       # Ver logs
```

### Testing

```bash
npm run test           # Tests unitarios
npm run test:e2e       # Tests e2e
npm run test:cov       # Coverage
```

## 🌐 URLs Disponibles

- **API**: http://localhost:3000
- **Adminer** (Admin DB): http://localhost:8080

## 📁 Estructura del Proyecto

```
src/
├── config/          # Configuración de base de datos
├── migrations/      # Migraciones de TypeORM
├── app.controller.ts
├── app.service.ts
├── app.module.ts
└── main.ts
```

## 📚 Documentación Adicional

- `DATABASE_SETUP.md` - Configuración detallada de base de datos
- `DOCKER_SETUP.md` - Guía completa de Docker
