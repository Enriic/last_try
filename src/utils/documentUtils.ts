// src/utils/documentUtils.ts

import { Validation } from '../types';

/**
 * Agrupa las validaciones por tipo de documento y calcula estadísticas
 * @param validations - Lista de validaciones a agrupar
 * @returns Array de objetos con estadísticas para cada tipo de documento (conteo, aprobados, rechazados, tasa de éxito)
 */
export const groupByDocumentType = (validations: Validation[]) => {
    // Reducir el array de validaciones para agrupar por tipo de documento
    const groups = validations.reduce((acc, val) => {
        // Usar el nombre del tipo de documento o "Desconocido" si no está disponible
        const type = val.document_type_name || "Desconocido";

        // Inicializar el contador para este tipo si no existe
        if (!acc[type]) {
            acc[type] = { document_type: type, count: 0, approved: 0, rejected: 0 };
        }

        // Incrementar el contador total para este tipo
        acc[type].count += 1;

        // Incrementar el contador específico según el estado
        if (val.status === 'success') {
            acc[type].approved += 1;
        } else if (val.status === 'failure') {
            acc[type].rejected += 1;
        }

        return acc;
    }, {} as any); // Acumulador inicial

    // Convertir el objeto agrupado a un array y calcular la tasa de éxito
    return Object.values(groups).map((group: any) => ({
        ...group,
        // Calcular la tasa de éxito como porcentaje (aprobados / total)
        successRate: group.count > 0 ? (group.approved / group.count) * 100 : 0,
    }));
};