import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCompletedCountAndScore1729015000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna completed_count
    await queryRunner.addColumn(
      'routes',
      new TableColumn({
        name: 'completed_count',
        type: 'int',
        default: 0,
        isNullable: false,
      }),
    );

    // Agregar columna score
    await queryRunner.addColumn(
      'routes',
      new TableColumn({
        name: 'score',
        type: 'int',
        default: 0,
        isNullable: false,
      }),
    );

    // Calcular y actualizar el score para rutas existentes
    // Formula: 10 puntos por cada 1km + bonus por distancias largas
    await queryRunner.query(`
      UPDATE routes 
      SET score = CASE
        WHEN distance_km >= 42 THEN FLOOR(distance_km * 10) + 500 + 200 + 100 + 50 + 20
        WHEN distance_km >= 21 THEN FLOOR(distance_km * 10) + 200 + 100 + 50 + 20
        WHEN distance_km >= 15 THEN FLOOR(distance_km * 10) + 100 + 50 + 20
        WHEN distance_km >= 10 THEN FLOOR(distance_km * 10) + 50 + 20
        WHEN distance_km >= 5 THEN FLOOR(distance_km * 10) + 20
        ELSE FLOOR(distance_km * 10)
      END
      WHERE distance_km IS NOT NULL AND score = 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('routes', 'score');
    await queryRunner.dropColumn('routes', 'completed_count');
  }
}
