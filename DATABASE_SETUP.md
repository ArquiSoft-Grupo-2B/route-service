# Configuración de Base de Datos

Este proyecto ahora incluye soporte para base de datos PostgreSQL con configuración para diferentes entornos.

## Configuración Inicial

1. **Instalar dependencias:**

   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   - Copia el archivo `env.example` como `.env.development` para desarrollo
   - Copia el archivo `env.example` como `.env.production` para producción
   - Configura las variables de base de datos según tu entorno

## Variables de Entorno Requeridas

```env
DB_HOST=tu_host_de_base_de_datos
DB_PORT=5432
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=nombre_de_tu_base_de_datos
PORT=3000
```

## Scripts Disponibles

- `npm run start:dev` - Ejecuta en modo desarrollo con NODE_ENV=development
- `npm run start:prod` - Ejecuta en modo producción con NODE_ENV=production
- `npm run build` - Compila el proyecto

## Estructura de Base de Datos

- **Entidades**: Se ubicarán en `src/**/**/*.entity.ts`
- **Migraciones**: Se ubicarán en `src/migrations/`
- **Configuración**: Se encuentra en `src/config/data.source.ts`

## Notas Importantes

- El proyecto utiliza TypeORM para el manejo de la base de datos
- La sincronización automática está habilitada (`synchronize: true`)
- Para producción, se recomienda deshabilitar la sincronización y usar migraciones
