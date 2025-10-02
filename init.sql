-- Archivo de inicialización de la base de datos
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor de PostgreSQL

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Verificar que las extensiones se crearon correctamente
SELECT 'Base de datos inicializada correctamente con PostGIS' AS message;

-- Crear tabla routes (si no existe)
CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id TEXT NOT NULL,
    name VARCHAR(150) NOT NULL,
    distance_km NUMERIC,
    est_time_min INTEGER,
    avg_rating NUMERIC DEFAULT 0,
    geometry GEOGRAPHY(LineString, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices
CREATE INDEX IF NOT EXISTS "IDX_routes_creator_id" ON "routes" ("creator_id");
CREATE INDEX IF NOT EXISTS "IDX_routes_avg_rating" ON "routes" ("avg_rating");
CREATE INDEX IF NOT EXISTS "IDX_routes_created_at" ON "routes" ("created_at");
CREATE INDEX IF NOT EXISTS "IDX_routes_geometry" ON "routes" USING GIST ("geometry");

-- Insertar rutas de seed
-- Ruta 1: Ruta del Parque Central
INSERT INTO routes (id, creator_id, name, distance_km, est_time_min, avg_rating, geometry, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'seed-user-001',
    'Ruta del Parque Central',
    2.5,
    25,
    4.5,
    ST_GeogFromText('LINESTRING(-74.089138889 4.643611111, -74.090500000 4.642722222, -74.095250000 4.650055556, -74.092444444 4.652527778)'),
    NOW(),
    NOW()
);

-- Ruta 2: Ruta Norte
INSERT INTO routes (id, creator_id, name, distance_km, est_time_min, avg_rating, geometry, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'seed-user-001',
    'Ruta Norte',
    3.2,
    30,
    4.2,
    ST_GeogFromText('LINESTRING(-74.079166667 4.634472222, -74.068000000 4.632444444, -74.066527778 4.632083333, -74.066722222 4.630777778)'),
    NOW(),
    NOW()
);

-- Ruta 3: Ruta Corta Este
INSERT INTO routes (id, creator_id, name, distance_km, est_time_min, avg_rating, geometry, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'seed-user-002',
    'Ruta Corta Este',
    1.5,
    15,
    4.8,
    ST_GeogFromText('LINESTRING(-74.084111111 4.645472222, -74.082305556 4.652888889)'),
    NOW(),
    NOW()
);

-- Ruta 4: Ruta Triangular
INSERT INTO routes (id, creator_id, name, distance_km, est_time_min, avg_rating, geometry, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'seed-user-002',
    'Ruta Triangular',
    2.0,
    20,
    4.0,
    ST_GeogFromText('LINESTRING(-74.083111111 4.644166667, -74.079333333 4.642722222, -74.079055556 4.646500000)'),
    NOW(),
    NOW()
);

-- Ruta 5: Ruta Larga Sur-Norte
INSERT INTO routes (id, creator_id, name, distance_km, est_time_min, avg_rating, geometry, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'seed-user-003',
    'Ruta Larga Sur-Norte',
    5.8,
    55,
    4.7,
    ST_GeogFromText('LINESTRING(-74.064916667 4.628388889, -74.051138889 4.660027778)'),
    NOW(),
    NOW()
);

-- Ruta 6: Ruta Oeste Extendida
INSERT INTO routes (id, creator_id, name, distance_km, est_time_min, avg_rating, geometry, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'seed-user-003',
    'Ruta Oeste Extendida',
    4.3,
    40,
    4.3,
    ST_GeogFromText('LINESTRING(-74.082777778 4.644305556, -74.086777778 4.647000000, -74.093250000 4.651527778, -74.100472222 4.656861111)'),
    NOW(),
    NOW()
);

-- Ruta 7: Ruta Sur Corta
INSERT INTO routes (id, creator_id, name, distance_km, est_time_min, avg_rating, geometry, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'seed-user-004',
    'Ruta Sur Corta',
    1.2,
    12,
    3.9,
    ST_GeogFromText('LINESTRING(-74.066500000 4.601416667, -74.061472222 4.603694444)'),
    NOW(),
    NOW()
);

-- Ruta 8: Ruta Circular
INSERT INTO routes (id, creator_id, name, distance_km, est_time_min, avg_rating, geometry, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'seed-user-004',
    'Ruta Circular',
    2.8,
    28,
    4.6,
    ST_GeogFromText('LINESTRING(-74.089000000 4.633861111, -74.092638889 4.630611111, -74.091027778 4.628166667, -74.085083333 4.632083333, -74.089027778 4.633722222)'),
    NOW(),
    NOW()
);

SELECT 'Se han insertado 8 rutas de seed exitosamente' AS message;