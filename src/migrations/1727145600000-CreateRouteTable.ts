import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateRouteTable1727145600000 implements MigrationInterface {
  name = 'CreateRouteTable1727145600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear extensión para UUID si no existe
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Crear extensión para PostGIS si no existe (para geometría)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "postgis"`);

    await queryRunner.createTable(
      new Table({
        name: 'routes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'creator_id',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '150',
            isNullable: false,
          },
          {
            name: 'distance_km',
            type: 'numeric',
            isNullable: true,
          },
          {
            name: 'est_time_min',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'avg_rating',
            type: 'numeric',
            isNullable: true,
          },
          {
            name: 'geometry',
            type: 'geography',
            spatialFeatureType: 'LineString',
            srid: 4326,
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Crear índices para mejorar el rendimiento
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_routes_creator_id" ON "routes" ("creator_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_routes_avg_rating" ON "routes" ("avg_rating")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_routes_created_at" ON "routes" ("created_at")
    `);

    // Crear índice espacial para geometría
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_routes_geometry" ON "routes" USING GIST ("geometry")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('routes');
  }
}
