// src/utils/kpiUtils.ts

import { Validation } from '../types';

/**
 * Calcula indicadores clave de rendimiento (KPIs) a partir de un conjunto de validaciones
 * @param validations - Lista de validaciones a analizar
 * @returns Objeto con los KPIs calculados
 */
export const calculateKPIs = (validations: Validation[]) => {
    // Número total de validaciones en el conjunto de datos
    const totalValidations = validations.length;

    // Número de validaciones aprobadas (estado 'success')
    const approved = validations.filter(v => v.status === 'success').length;

    // Número de validaciones rechazadas (estado 'failure')
    const rejected = validations.filter(v => v.status === 'failure').length;

    // Tasa de éxito como porcentaje (validaciones aprobadas / total)
    // Devuelve 0 si no hay validaciones para evitar división por cero
    const successRate = totalValidations > 0 ? (approved / totalValidations) * 100 : 0;

    // Tiempo promedio de validación en segundos
    // Calcula la suma de todos los tiempos y la divide por el número total de validaciones
    // Devuelve 0 si no hay validaciones para evitar división por cero
    const averageValidationTime =
        totalValidations > 0
            ? validations.reduce((acc, v) => acc + (v.validation_time || 0), 0) / totalValidations
            : 0;

    // Devuelve un objeto con todos los KPIs calculados
    return {
        totalValidations,
        approved,
        rejected,
        successRate,
        averageValidationTime,
    };
};