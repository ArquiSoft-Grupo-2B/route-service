# Routes API

Servicio de rutas geoespaciales para RunPath Bogotá. Construido con NestJS, TypeORM, PostgreSQL+PostGIS, RabbitMQ y arquitectura hexagonal.

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

### 🌱 Datos de Seed

Al levantar el contenedor de Docker por primera vez, se cargan automáticamente **8 rutas predefinidas** en la base de datos, ubicadas en Bogotá, Colombia. Estas rutas están listas para probar las funcionalidades de la API sin necesidad de crear datos manualmente.

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

## 📖 Documentación Swagger (OpenAPI)

La API cuenta con documentación interactiva completa generada con Swagger/OpenAPI.

### Acceso a Swagger UI

**URL:** http://localhost:3000/api/docs

### Características de Swagger

- 🔍 **Exploración Interactiva**: Prueba todos los endpoints directamente desde el navegador
- 🔐 **Autenticación JWT**: Botón "Authorize" para configurar el Bearer Token
- 📋 **Ejemplos Completos**: Cada endpoint incluye ejemplos de request/response
- 📊 **Esquemas de Datos**: Documentación detallada de todos los DTOs
- 🏷️ **Tags Organizados**: Endpoints agrupados por funcionalidad (routes, search, etc.)

### Cómo Usar Swagger

1. **Abrir Swagger UI**: Navega a http://localhost:3000/api/docs
2. **Explorar Endpoints**: Expande cualquier endpoint para ver detalles
3. **Autenticarse** (para endpoints protegidos):
   - Haz clic en el botón "Authorize" (🔒) en la parte superior derecha
   - Ingresa tu token JWT en el formato: `tu_token_aqui` (sin "Bearer ")
   - Haz clic en "Authorize" y luego "Close"
4. **Probar Endpoints**:
   - Haz clic en "Try it out" en cualquier endpoint
   - Completa los parámetros requeridos
   - Haz clic en "Execute"
   - Revisa la respuesta en la sección "Responses"

### Ejemplos de Peticiones

#### Crear una Ruta (Requiere Autenticación)

```bash
POST /routes
Authorization: Bearer <tu_token_jwt>
Content-Type: application/json

{
  "name": "Ruta del Parque Simón Bolívar",
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [-74.08581, 4.63692],
      [-74.08399, 4.63854],
      [-74.08213, 4.64019]
    ]
  }
}
```

#### Buscar Rutas Cercanas (Público)

```bash
GET /routes/near?lat=4.6367&lng=-74.0858&radius_m=5000
```

#### Completar una Ruta (Requiere Autenticación)

```bash
POST /routes/{id}/complete
Authorization: Bearer <tu_token_jwt>
Content-Type: application/json

{
  "completed": true,
  "actualTimeMin": 42
}
```

### Configuración de Swagger

La documentación incluye:

- **Título**: Routes API
- **Versión**: 1.0
- **Servidores**:
  - Desarrollo: http://localhost:3000
  - Producción: https://api.routes.com
- **Esquema de Autenticación**: Bearer JWT (Firebase Authentication)
- **Tags**: routes, search

## 📡 Endpoints Disponibles

### Públicos (sin autenticación)

- `GET /routes` - Obtener todas las rutas (opcional: `?includeCreator=true`)
- `GET /routes/near?lat=X&lng=Y&radius_m=Z` - Buscar rutas cercanas (geoespacial)
- `GET /routes/:id` - Obtener ruta por ID
- `GET /routes/creator/:creatorId` - Rutas por creador
- `GET /routes/rating?min=X&max=Y` - Filtrar por calificación
- `GET /routes/:id/directions?fromLat=X&fromLng=Y` - Obtener indicaciones al inicio de ruta

### Protegidos (requieren JWT)

- `POST /routes` - Crear nueva ruta (calcula distancia, tiempo y score automáticamente)
- `PATCH /routes/:id` - Actualizar ruta (solo propietario)
- `DELETE /routes/:id` - Eliminar ruta (solo propietario)
- `POST /routes/:id/complete` - Completar ruta y publicar evento a RabbitMQ

> 📖 **Documentación interactiva completa disponible en Swagger**: http://localhost:3000/api/docs

## 📁 Estructura del Proyecto (Arquitectura Hexagonal)

```
src/
├── common/                     # Módulos compartidos
│   ├── guards/                 # Guards de autenticación y autorización
│   │   ├── auth-service.guard.ts
│   │   └── route-owner.guard.ts
│   ├── interfaces/             # Interfaces compartidas
│   └── services/               # Clientes de servicios externos
│       ├── auth-service.client.ts
│       └── route-enrichment.service.ts
├── config/                     # Configuración
│   └── data.source.ts          # Configuración de TypeORM
├── migrations/                 # Migraciones de base de datos
├── routes/                     # Módulo principal (Arquitectura Hexagonal)
│   ├── domain/                 # Capa de Dominio (reglas de negocio)
│   │   ├── entities/           # Entidades de dominio
│   │   │   └── route.entity.ts
│   │   ├── events/             # Eventos de dominio
│   │   │   └── route-completed.event.ts (con enum RouteEventType)
│   │   └── repositories/       # Interfaces de repositorios
│   ├── application/            # Capa de Aplicación (casos de uso)
│   │   └── use-cases/          # 10 casos de uso
│   │       ├── create-route.usecase.ts
│   │       ├── get-routes.usecase.ts
│   │       ├── complete-route.usecase.ts
│   │       └── ...
│   ├── infrastructure/         # Capa de Infraestructura (detalles técnicos)
│   │   ├── persistence/        # Implementación de repositorios
│   │   │   └── route.repository.impl.ts
│   │   ├── services/           # Servicios externos
│   │   │   ├── route-calculation.service.ts (OSRM)
│   │   │   └── score-calculation.service.ts
│   │   ├── messaging/          # Sistema de mensajería
│   │   │   └── rabbitmq.service.ts
│   │   └── mappers/            # Mappers DTO ↔ Dominio
│   │       └── route.mapper.ts
│   ├── presentation/           # Capa de Presentación (HTTP)
│   │   └── routes.controller.ts
│   ├── dto/                    # Data Transfer Objects
│   │   ├── create-route.dto.ts
│   │   ├── complete-route.dto.ts
│   │   └── ...
│   └── routes.module.ts        # Módulo NestJS
├── types/                      # Tipos TypeScript globales
├── utils/                      # Utilidades
├── app.module.ts               # Módulo principal de la aplicación
└── main.ts                     # Punto de entrada
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

### Variables de RabbitMQ (Sistema de Eventos)

| Variable                          | Obligatoria | Descripción                                       | Valor por defecto                |
| --------------------------------- | ----------- | ------------------------------------------------- | -------------------------------- |
| `RABBITMQ_URL`                    | Sí          | URL de conexión a RabbitMQ                        | `amqp://guest:guest@rabbit:5672` |
| `RABBITMQ_EXCHANGE`               | Sí          | Nombre del exchange para eventos                  | `notification-exchange`          |
| `RABBITMQ_EXCHANGE_TYPE`          | Opcional    | Tipo de exchange (direct, topic, fanout, headers) | `direct`                         |
| `RABBITMQ_ROUTING_KEY`            | Sí          | Routing key para eventos de rutas                 | `notification-routing-key`       |
| `RABBITMQ_MAX_RECONNECT_ATTEMPTS` | Opcional    | Máximo número de intentos de reconexión           | `5`                              |
| `RABBITMQ_RECONNECT_DELAY`        | Opcional    | Delay entre intentos de reconexión (ms)           | `5000`                           |

> 💡 **Notas importantes:**
>
> - Si `AUTH_SERVICE_URL` no está definido, los guards de autenticación lanzarán error y los endpoints protegidos fallarán.
> - El exchange, tipo y routing key de RabbitMQ deben coincidir con la configuración del servicio consumidor (Notification Service).

### Variables adicionales para Docker Compose

Cuando se ejecuta con `docker-compose`, también puedes personalizar:

| Variable            | Descripción                                       | Valor por defecto |
| ------------------- | ------------------------------------------------- | ----------------- |
| `POSTGRES_DB`       | Nombre de la base creada al iniciar el contenedor | `routes_db`       |
| `POSTGRES_USER`     | Usuario inicial de PostgreSQL                     | `routes_user`     |
| `POSTGRES_PASSWORD` | Contraseña del usuario inicial                    | `routes_password` |

## 🔌 Arquitectura de Microservicios

Este servicio se integra con otros microservicios para funcionar completamente:

### 🛡️ Servicio de Autenticación (GraphQL)

- **URL**: `http://localhost:8000/graphql`
- **Función**: Validación de JWT y gestión de usuarios
- **Estado**: Requerido para endpoints protegidos
- **Tecnología**: GraphQL API
- **Operaciones**:
  - Verificación de tokens JWT
  - Obtener información de usuarios
  - Enriquecimiento de rutas con datos del creador

### ⚡ Servicio de Cálculo (OSRM - C++)

- **URL**: Configurable vía `CALCULATION_SERVICE_URL` (por defecto `http://localhost:5002`)
- **Función**: Cálculos geoespaciales precisos
- **Estado**: Requerido, con fallback local
- **Tecnología**: OSRM (Open Source Routing Machine)
- **Operaciones**:
  - `GET /route/v1/{profile}/{coordinates}` - Calcula distancia/tiempo
  - `GET /route/v1/{profile}/{coordinates}` - Genera indicaciones peatonales
- **Perfiles soportados**: walking, cycling, driving

### 📬 Servicio de Notificaciones (Consumer)

- **Protocolo**: RabbitMQ (AMQP)
- **Exchange**: `notification-exchange` (tipo: `direct`)
- **Routing Key**: `notification-routing-key`
- **Función**: Consumir eventos de rutas completadas
- **Estado**: Opcional (eventos se publican aunque no haya consumidor)
- **Eventos publicados**:
  - `ROUTE_COMPLETED` - Cuando un usuario completa una ruta

### 🐰 RabbitMQ (Message Broker)

- **URL**: `amqp://guest:guest@rabbit:5672`
- **Función**: Sistema de mensajería asíncrona
- **Características**:
  - Reconexión automática (máx. 5 intentos)
  - Exchange durable
  - Mensajes persistentes
  - Health checks integrados

## 🎯 Sistema de Eventos (Event-Driven Architecture)

### Evento: `ROUTE_COMPLETED`

Publicado cuando un usuario completa una ruta.

**Estructura del evento:**

```typescript
{
  eventType: RouteEventType.ROUTE_COMPLETED,  // Enum
  routeId: string,
  routeName: string,
  creatorId: string,
  userId: string,
  completed: boolean,
  score: number,
  distanceKm?: number,
  estTimeMin?: number,
  actualTimeMin?: number,
  timestamp: string  // ISO 8601
}
```

**Flujo:**

1. Usuario completa una ruta: `POST /routes/:id/complete`
2. Se incrementa el contador `completed_count` en la ruta
3. Se construye el evento `ROUTE_COMPLETED`
4. Se publica al exchange de RabbitMQ
5. El servicio de notificaciones lo consume y envía notificaciones

**Enum de Eventos de Dominio:**

```typescript
export enum RouteEventType {
  ROUTE_COMPLETED = 'ROUTE_COMPLETED',
  // Futuros eventos aquí...
}
```

> ⚠️ **Sin estos servicios**:
>
> - Sin Auth Service: endpoints protegidos fallarán
> - Sin Calculation Service: se usarán cálculos locales (menos precisos)
> - Sin RabbitMQ: no se publicarán eventos (el endpoint fallará)

## 🎮 Sistema de Gamificación (Score)

El servicio incluye un sistema de puntuación para incentivar a los usuarios:

### Cálculo de Score

**Fórmula base:** 10 puntos por kilómetro

**Bonus por distancias:**

- 5 km → +20 puntos bonus
- 10 km → +50 puntos bonus
- 15 km → +100 puntos bonus
- 21 km (media maratón) → +200 puntos bonus
- 42 km (maratón) → +500 puntos bonus

**Ejemplo:**

- Ruta de 5.2 km = 52 puntos base + 20 bonus = **72 puntos**
- Ruta de 10.5 km = 105 puntos base + 50 bonus = **155 puntos**
- Ruta de 21 km = 210 puntos base + 200 bonus = **410 puntos**

### Características

- ✅ Cálculo automático al crear la ruta
- ✅ Score incluido en eventos de completación
- ✅ Visible en todas las consultas de rutas
- ✅ Preparado para multiplicadores de dificultad futuros

## 🚀 Características Principales

- ✨ **Arquitectura Hexagonal (DDD)**: Separación clara de capas de dominio, aplicación, infraestructura y presentación
- 🗺️ **Búsqueda Geoespacial**: PostGIS para consultas de proximidad eficientes
- 🔐 **Autenticación JWT**: Integración con servicio de autenticación via GraphQL
- 📬 **Event-Driven**: Publicación de eventos a RabbitMQ para arquitectura asíncrona
- 📊 **Cálculos Precisos**: Integración con OSRM para distancias y tiempos reales
- 🎮 **Sistema de Gamificación**: Score automático basado en distancia
- 📚 **Documentación Swagger**: API completamente documentada e interactiva
- 🐳 **Docker Ready**: Configuración completa con Docker Compose
- 🔄 **Resilente**: Fallbacks, reconexión automática y manejo robusto de errores
- 📈 **Observabilidad**: Logging detallado en todos los servicios

## 🛠️ Tecnologías y Dependencias

### Backend

- **NestJS 11.x** - Framework progresivo de Node.js
- **TypeScript 5.x** - Superset tipado de JavaScript
- **TypeORM 0.3.x** - ORM para TypeScript y JavaScript

### Base de Datos

- **PostgreSQL 15** - Base de datos relacional
- **PostGIS 3.3** - Extensión geoespacial para PostgreSQL

### Mensajería

- **RabbitMQ** - Message broker AMQP
- **amqplib** - Cliente de RabbitMQ para Node.js

### Integraciones

- **GraphQL** (graphql-request) - Cliente para Auth Service
- **OSRM** - Motor de routing para cálculos precisos

### Validación y Documentación

- **class-validator** - Validación de DTOs basada en decoradores
- **class-transformer** - Transformación de objetos
- **Swagger/OpenAPI** - Documentación interactiva de la API

### Autenticación

- **jsonwebtoken** - Manejo de tokens JWT
- **Firebase Authentication** - Integración con servicio de auth

## 📚 Documentación Adicional

- [`DATABASE_SETUP.md`](./DATABASE_SETUP.md) - Configuración detallada de base de datos
- [`DOCKER_SETUP.md`](./DOCKER_SETUP.md) - Guía completa de Docker
- [`AUTH_INTEGRATION.md`](./AUTH_INTEGRATION.md) - Integración con Authentication Service
