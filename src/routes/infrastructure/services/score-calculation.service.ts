import { Injectable } from '@nestjs/common';

/**
 * Configuración para el cálculo de score
 */
export interface ScoreCalculationConfig {
  /** Puntos por cada kilómetro recorrido */
  pointsPerKm: number;
  /** Multiplicador de dificultad (para futuras implementaciones) */
  difficultyMultiplier?: number;
  /** Umbrales de distancia con bonus adicionales */
  bonusThresholds?: {
    distance: number; // Distancia en kilómetros
    bonus: number; // Puntos de bonus
  }[];
}

/**
 * Servicio para calcular el score de una ruta basado en su distancia
 *
 * Formula base: 10 puntos por cada 1km
 * + Bonus por distancias largas
 */
@Injectable()
export class ScoreCalculationService {
  private readonly defaultConfig: ScoreCalculationConfig = {
    pointsPerKm: 10,
    bonusThresholds: [
      { distance: 5, bonus: 20 }, // 5km = +20 puntos bonus
      { distance: 10, bonus: 50 }, // 10km = +50 puntos bonus
      { distance: 15, bonus: 100 }, // 15km = +100 puntos bonus
      { distance: 21, bonus: 200 }, // 21km (media maratón) = +200 puntos bonus
      { distance: 42, bonus: 500 }, // 42km (maratón) = +500 puntos bonus
    ],
  };

  /**
   * Calcula el score basado en la distancia de la ruta
   * @param distanceKm - Distancia de la ruta en kilómetros
   * @param config - Configuración opcional para personalizar el cálculo
   * @returns Score calculado
   */
  calculateScore(
    distanceKm: number,
    config?: Partial<ScoreCalculationConfig>,
  ): number {
    if (!distanceKm || distanceKm <= 0) {
      return 0;
    }

    const finalConfig = { ...this.defaultConfig, ...config };

    // Puntos base: 10 puntos por km
    let score = Math.floor(distanceKm * finalConfig.pointsPerKm);

    // Aplicar bonus por distancias largas
    if (finalConfig.bonusThresholds) {
      for (const threshold of finalConfig.bonusThresholds) {
        if (distanceKm >= threshold.distance) {
          score += threshold.bonus;
        }
      }
    }

    return score;
  }

  /**
   * Calcula score con multiplicador de dificultad
   * Útil para futuras implementaciones que consideren elevación, terreno, etc.
   * @param distanceKm - Distancia de la ruta en kilómetros
   * @param difficultyLevel - Nivel de dificultad (1.0 = normal, 1.5 = difícil, 2.0 = muy difícil)
   * @returns Score calculado con multiplicador de dificultad
   */
  calculateScoreWithDifficulty(
    distanceKm: number,
    difficultyLevel: number = 1,
  ): number {
    const baseScore = this.calculateScore(distanceKm);
    return Math.floor(baseScore * difficultyLevel);
  }

  /**
   * Obtiene la descripción del score para mostrar al usuario
   * @param score - Score calculado
   * @param distanceKm - Distancia de la ruta
   * @returns Descripción legible del score
   */
  getScoreDescription(score: number, distanceKm: number): string {
    const basePoints = Math.floor(distanceKm * this.defaultConfig.pointsPerKm);
    const bonusPoints = score - basePoints;

    if (bonusPoints > 0) {
      return `${score} puntos (${basePoints} base + ${bonusPoints} bonus)`;
    }
    return `${score} puntos`;
  }
}
