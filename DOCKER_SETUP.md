# Docker Setup - Proyecto Routes

Este proyecto incluye configuración completa de Docker con PostgreSQL para desarrollo local.

## Archivos de Configuración

- `Dockerfile` - Configuración para construir la imagen de la aplicación
- `docker-compose.yml` - Configuración completa (app + base de datos)
- `docker-compose.dev.yml` - Solo base de datos para desarrollo local
- `.dockerignore` - Archivos a ignorar en la construcción
- `init.sql` - Script de inicialización de la base de datos

## Opciones de Ejecución

### Opción 1: Solo Base de Datos (Recomendado para desarrollo)

Para ejecutar solo PostgreSQL y desarrollar la app localmente:

```bash
# Levantar solo la base de datos
docker-compose -f docker-compose.dev.yml up -d

# Instalar dependencias localmente
npm install

# Ejecutar la aplicación en modo desarrollo
npm run start:dev
```

### Opción 2: Aplicación Completa en Docker

Para ejecutar toda la aplicación en contenedores:

```bash
# Construir y levantar todos los servicios
docker-compose up --build

# O en modo detached (segundo plano)
docker-compose up -d --build
```

## Servicios Disponibles

- **Aplicación NestJS**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Adminer** (Administrador DB): http://localhost:8080

## Credenciales de Base de Datos

```
Host: localhost
Puerto: 5432
Base de datos: routes_db
Usuario: routes_user
Contraseña: routes_password
```

## Comandos Útiles

```bash
# Ver logs de los contenedores
docker-compose logs -f

# Detener los servicios
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: elimina datos)
docker-compose down -v

# Reconstruir solo la aplicación
docker-compose up --build app

# Ejecutar comandos dentro del contenedor de la app
docker-compose exec app npm run test
```

## Desarrollo

1. **Primera vez:**

   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   npm install
   npm run start:dev
   ```

2. **Días siguientes:**
   ```bash
   docker-compose -f docker-compose.dev.yml start
   npm run start:dev
   ```

## Troubleshooting

- Si hay problemas de permisos, ejecutar Docker como administrador
- Si el puerto 5432 está ocupado, cambiar el mapeo en docker-compose
- Para limpiar todo: `docker system prune -a`
