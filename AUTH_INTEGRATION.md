# Integración con Authentication Service

Este documento explica cómo usar la integración con el Authentication Service en el Route Service.

## Configuración

### Variables de Entorno

Añade a tu archivo `.env.development`:

```bash
AUTH_SERVICE_URL=http://localhost:8000/graphql
AUTH_SERVICE_JWT_SECRET=tu_secreto_compartido_con_auth_service
```

## Servicios Disponibles

### AuthServiceClient

Servicio para comunicarse con el Authentication Service via GraphQL:

```typescript
// Obtener usuario por ID
const user = await authServiceClient.getUserById('firebase-uid-123');

// Validar si un usuario existe
const isValid = await authServiceClient.validateUser('firebase-uid-123');

// Crear usuario
const newUser = await authServiceClient.createUser({
  email: 'test@example.com',
  password: 'password123',
  alias: 'TestUser'
});

// Login
const token = await authServiceClient.loginUser('test@example.com', 'password123');
```

### RouteEnrichmentService

Servicio para enriquecer rutas con información del creador:

```typescript
// Enriquecer una ruta con info del creador
const enrichedRoute = await routeEnrichmentService.enrichRouteWithCreator(route);

// Enriquecer múltiples rutas
const enrichedRoutes = await routeEnrichmentService.enrichRoutesWithCreators(routes);

// Obtener resumen público del creador
const creatorSummary = await routeEnrichmentService.getCreatorSummary('firebase-uid-123');
```

## Guards Actualizados

### AuthServiceGuard

Ahora valida usuarios contra el Authentication Service:

- Verifica JWT
- Valida existencia del usuario en el Auth Service
- Obtiene información completa del usuario
- Añade `userInfo` al request object

```typescript
@UseGuards(AuthServiceGuard)
@Post()
async create(@Request() request: any) {
  const userId = request.user.uid;
  const userInfo = request.user.userInfo; // Información completa del usuario
  // ...
}
```

### RouteOwnerGuard

Mejorado con logging detallado y mejor manejo de errores.

## API Endpoints Mejorados

### GET /routes

Ahora soporta parámetro opcional para incluir información del creador:

```bash
# Solo rutas básicas
GET /routes

# Rutas con información del creador
GET /routes?includeCreator=true
```

Respuesta con `includeCreator=true`:

```json
{
  "success": true,
  "message": "Rutas con información de creadores obtenidas exitosamente",
  "data": [
    {
      "id": "route-uuid",
      "name": "Mi Ruta",
      "creator_id": "firebase-uid",
      "creator": {
        "id": "firebase-uid",
        "alias": "JohnRunner",
        "email": "john@***"
      }
    }
  ]
}
```

## Queries GraphQL Disponibles

### Para obtener usuario:
```graphql
query GetUser($userId: String!) {
  getUser(userId: $userId) {
    id
    email
    alias
    photoUrl
  }
}
```

### Para listar usuarios:
```graphql
query ListUsers {
  listUsers {
    id
    email
    alias
    photoUrl
  }
}
```

### Para crear usuario:
```graphql
mutation CreateUser($userInput: UserInput!) {
  createUser(userInput: $userInput) {
    id
    email
    alias
    photoUrl
  }
}
```

### Para login:
```graphql
mutation LoginUser($email: String!, $password: String!) {
  loginUser(email: $email, password: $password) {
    localId
    email
    alias
    idToken
    registered
    refreshToken
    expiresIn
  }
}
```

## Ejemplos de Uso

### Validación en Controllers

```typescript
@UseGuards(AuthServiceGuard)
@Post()
async create(@Body() dto: CreateRouteDto, @Request() request: any) {
  const userId = request.user.uid;
  const userEmail = request.user.userInfo?.email;
  
  // El usuario está validado y existe en el Auth Service
  const route = await this.createRouteUseCase.execute(dto, userId);
  return route;
}
```

### Enriquecimiento de Respuestas

```typescript
async findAll(@Query('includeCreator') includeCreator?: string) {
  const shouldInclude = includeCreator === 'true';
  const routes = await this.getRoutesUseCase.execute(shouldInclude);
  
  // Si includeCreator=true, las rutas incluyen información del creador
  return { success: true, data: routes };
}
```

## Manejo de Errores

Los servicios manejan automáticamente:

- **Token expirado**: `UnauthorizedException('Token expirado')`
- **Usuario no encontrado**: `UnauthorizedException('Usuario no encontrado')`
- **Token inválido**: `UnauthorizedException('Token inválido')`
- **Errores de red**: Logging automático y respuestas de fallback
- **Errores del Auth Service**: Logging detallado para debugging

## Logging

Todos los servicios incluyen logging detallado:

```
[AuthServiceGuard] Usuario autenticado: firebase-uid-123 - user@example.com
[RouteOwnerGuard] Acceso autorizado - Usuario: firebase-uid-123 accedió a su ruta: route-id
[AuthServiceClient] Error executing GraphQL query: Connection refused
[RouteEnrichmentService] Creador no encontrado para ruta route-id, creator_id: firebase-uid
```