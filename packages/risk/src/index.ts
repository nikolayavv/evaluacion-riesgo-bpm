// Motor de riesgo (RF-14). Responsable: P4. Se deja como stub en la base común
// porque apps/api y apps/web ya importan el paquete, pero la fórmula NO está
// acordada todavía (ver D04-D07 en el plan de arquitectura).
//
// Pendiente antes de implementar en serio:
//  - D06: escala del riesgo de producto (2/4/8 vs 1/2/3) sin resolver.
//  - D05: criterios de aprobación / no conformidad sin resolver (J207 vs B40).
//  - Riesgo químico faltante en la hoja de categorización.
//
// No usar este cálculo como resultado oficial. Está aquí solo para que el
// resto del sistema tenga un contrato estable mientras se decide la fórmula.

export interface FactoresEstablecimiento {
  volumenProduccion: number; // 0-1 normalizado, peso observado 16%
  implementacionHaccp: number; // peso observado 9%
  cumplimientoBpm: number; // peso observado 56%
  proveedorInabie: number; // peso observado 5%
  rechazosMicrobiologicos: number; // peso observado 6%
  planMuestreo: number; // peso observado 8%
}

export const PESOS_ESTABLECIMIENTO = {
  volumenProduccion: 0.16,
  implementacionHaccp: 0.09,
  cumplimientoBpm: 0.56,
  proveedorInabie: 0.05,
  rechazosMicrobiologicos: 0.06,
  planMuestreo: 0.08,
} as const;

export type NivelRiesgo = 'bajo' | 'medio' | 'alto';

export interface ResultadoRiesgo {
  riesgoEstablecimiento: number;
  riesgoProductoNormalizado: number; // TODO(D06): definir escala antes de calcular en serio
  riesgoTotal: number;
  nivel: NivelRiesgo;
  frecuencia: 'anual' | 'semestral' | 'trimestral';
}

/**
 * Calcula el riesgo ponderado del establecimiento (suma de factores × peso).
 * No convierte datos faltantes en cero (ver nota del plan): si falta un factor,
 * el llamador debe excluirlo explícitamente antes de invocar esta función.
 */
export function calcularRiesgoEstablecimiento(factores: FactoresEstablecimiento): number {
  return (
    factores.volumenProduccion * PESOS_ESTABLECIMIENTO.volumenProduccion +
    factores.implementacionHaccp * PESOS_ESTABLECIMIENTO.implementacionHaccp +
    factores.cumplimientoBpm * PESOS_ESTABLECIMIENTO.cumplimientoBpm +
    factores.proveedorInabie * PESOS_ESTABLECIMIENTO.proveedorInabie +
    factores.rechazosMicrobiologicos * PESOS_ESTABLECIMIENTO.rechazosMicrobiologicos +
    factores.planMuestreo * PESOS_ESTABLECIMIENTO.planMuestreo
  );
}

/** Clasifica un riesgo total ya calculado según los tramos del SRS (1.0-3.6 / 3.6-6.3 / >6.3). */
export function clasificarRiesgoTotal(riesgoTotal: number): {
  nivel: NivelRiesgo;
  frecuencia: ResultadoRiesgo['frecuencia'];
} {
  if (riesgoTotal <= 3.6) return { nivel: 'bajo', frecuencia: 'anual' };
  if (riesgoTotal <= 6.3) return { nivel: 'medio', frecuencia: 'semestral' };
  return { nivel: 'alto', frecuencia: 'trimestral' };
}
