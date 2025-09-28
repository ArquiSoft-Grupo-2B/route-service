# Routes API

Servicio de rutas geoespaciales para RunPath Bogotá. NestJS con TypeORM, PostgreSQL+PostGIS y arquitectura hexagonal.

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

La aplicación usa PostgreSQL+PostGIS para datos geoespaciales:

```
Host: localhost
Puerto: 5432 (producción) / 5433 (desarrollo)
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
- **Swagger Docs**: http://localhost:3000/api/docs
- **Adminer** (Admin DB): http://localhost:8080

## 📡 Endpoints Disponibles

### Públicos (sin autenticación)

- `GET /routes` - Obtener todas las rutas
- `GET /routes/near?lat=X&lng=Y&radius_m=Z` - Buscar rutas cercanas
- `GET /routes/:id` - Obtener ruta por ID
- `GET /routes/creator/:creatorId` - Rutas por creador
- `GET /routes/rating?min=X&max=Y` - Filtrar por calificación

### Protegidos (requieren JWT)

- `POST /routes` - Crear nueva ruta
- `PATCH /routes/:id` - Actualizar ruta (solo propietario)
- `DELETE /routes/:id` - Eliminar ruta (solo propietario)

### Funcionalidades especiales

- `GET /routes/:id/directions?fromLat=X&fromLng=Y` - Indicaciones al inicio de ruta

> 📖 **Documentación interactiva completa disponible en Swagger**: http://localhost:3000/api

## 📁 Estructura del Proyecto

```
src/
├── common/          # Guards y módulos compartidos
├── config/          # Configuración de base de datos
├── migrations/      # Migraciones de TypeORM
├── routes/          # Módulo principal (arquitectura hexagonal)
│   ├── domain/      # Entidades y contratos
│   ├── application/ # Casos de uso
│   ├── infrastructure/ # Implementaciones
│   └── presentation/   # Controladores HTTP
├── app.module.ts
└── main.ts
```

## ⚙️ Variables de Entorno

1. Copia el archivo de ejemplo: `cp env.example .env.development`
2. Ajusta los valores según tu entorno.

| Variable                  | Obligatoria               | Descripción                                                          | Valor por defecto / ejemplo                  |
| ------------------------- | ------------------------- | -------------------------------------------------------------------- | -------------------------------------------- |
| `NODE_ENV`                | Opcional                  | Define el entorno activo y el archivo `.env` a cargar                | `development`                                |
| `PORT`                    | Opcional                  | Puerto HTTP donde expone la API NestJS                               | `3000`                                       |
| `FRONTEND_URL`            | Opcional                  | Origen permitido para CORS (UI/web)                                  | `http://localhost:3001`                      |
| `DB_HOST`                 | Sí                        | Host de la base de datos PostgreSQL/PostGIS                          | `localhost` (dev) / `postgres` (Docker)      |
| `DB_PORT`                 | Sí                        | Puerto de PostgreSQL                                                 | `5433` (dev) / `5432` (Docker)               |
| `DB_USER`                 | Sí                        | Usuario de la base de datos                                          | `routes_user`                                |
| `DB_PASSWORD`             | Sí                        | Contraseña del usuario                                               | `routes_password`                            |
| `DB_NAME`                 | Sí                        | Nombre de la base de datos                                           | `routes_db`                                  |
| `CALCULATION_SERVICE_URL` | Sí                        | URL base del servicio OSRM/C++ para métricas y direcciones           | `http://localhost:5002` (fallback en código) |
| `OSRM_PROFILE`            | Opcional                  | Perfil de OSRM a utilizar (`walking`, `cycling`, `driving`, etc.)    | `walking`                                    |
| `AUTH_SERVICE_URL`        | Sí (endpoints protegidos) | Endpoint GraphQL del servicio de autenticación                       | `http://localhost:8000/graphql`              |
| `AUTH_SERVICE_JWT_SECRET` | Sí (prod/docker)          | Secreto compartido con el servicio de autenticación para validar JWT | `tu_secreto_compartido_con_auth_service`     |

> 💡 Si `AUTH_SERVICE_URL` no está definido, los guards de autenticación lanzarán error y los endpoints protegidos fallarán.

### Variables adicionales para Docker Compose

Cuando se ejecuta con `docker-compose`, también puedes personalizar:

| Variable            | Descripción                                       | Valor por defecto |
| ------------------- | ------------------------------------------------- | ----------------- |
| `POSTGRES_DB`       | Nombre de la base creada al iniciar el contenedor | `routes_db`       |
| `POSTGRES_USER`     | Usuario inicial de PostgreSQL                     | `routes_user`     |
| `POSTGRES_PASSWORD` | Contraseña del usuario inicial                    | `routes_password` |

## 🔌 Dependencias de Microservicios

Este servicio **requiere** otros servicios para funcionar completamente:

### 🛡️ Servicio de Autenticación

- **Debe estar corriendo** para endpoints protegidos
- **Genera JWT** que este servicio valida
- **Secret compartido** debe coincidir

### ⚡ Servicio de Cálculo (C++)

- **Puerto configurable vía** `CALCULATION_SERVICE_URL` (por defecto `http://localhost:8080`)
- **POST /calculate** - Calcula distancia/tiempo de rutas
- **POST /directions** - Genera indicaciones peatonales

> ⚠️ **Sin estos servicios**, las funciones de autenticación y cálculo precisos no funcionarán.

## 📚 Documentación Adicional

- `DATABASE_SETUP.md` - Configuración detallada de base de datos
- `DOCKER_SETUP.md` - Guía completa de Docker
