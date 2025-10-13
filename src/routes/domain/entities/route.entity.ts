import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Interfaz GeoJSON LineString
export interface LineString {
  type: 'LineString';
  coordinates: number[][];
}

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  creator_id: string;

  @Column({ type: 'varchar', length: 150, nullable: false })
  name: string;

  @Column({ type: 'numeric', nullable: true })
  distance_km: number;

  @Column({ type: 'int', nullable: true })
  est_time_min: number;

  @Column({ type: 'numeric', default: 0 })
  avg_rating: number;

  @Column({
    type: 'geography',
    spatialFeatureType: 'LineString',
    srid: 4326,
    nullable: true,
  })
  geometry: LineString;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

