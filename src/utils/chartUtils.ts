// src/utils/chartUtils.ts

import { Validation, ValidationStatus } from '../types';
import moment from 'moment';

/**
 * Tipo que representa una entrada en la distribución de validaciones
 * Contiene el estado de validación y su valor numérico
 */
type DistributionEntry = {
    status: Validation["status"];
    value: number;
};

/**
 * Agrupa las validaciones por mes para visualizaciones temporales
 * @param validations - Lista de validaciones a agrupar
 * @returns Array de objetos con nombre del mes y número de validaciones
 */
export const groupValidationsByMonth = (validations: Validation[]) => {
    // Crear array con los 12 meses, inicializando el contador de validaciones a 0
    const months = Array.from({ length: 12 }, (_, i) => ({
        month: moment().month(i).format('MMMM'),
        validations: 0,
    }));

    // Para cada validación, incrementar el contador del mes correspondiente
    validations.forEach((validation) => {
        const monthIndex = moment(validation.timestamp).month();
        months[monthIndex].validations += 1;
    });

    return months;
};

/**
 * Calcula la distribución de validaciones por estado (éxito/fallo)
 * @param validations - Lista de validaciones a analizar
 * @returns Array de objetos con el estado y el número de validaciones
 */
export const calculateValidationDistribution = (validations: Validation[]): DistributionEntry[] => {
    console.log('Calculating validation distribution with validations:', validations);

    // Reducir el array de validaciones para contar por estado
    const distribution = validations.reduce(
        (acc, val) => {
            if (val.status === 'success') {
                acc.success += 1;
            } else if (val.status === 'failure') {
                acc.failed += 1;
            }
            // Si tienes otros estados como 'pending', puedes agregarlos aquí
            return acc;
        },
        { success: 0, failed: 0 }
    );

    // Preparar los datos para el gráfico
    const data: DistributionEntry[] = [
        { status: ValidationStatus.SUCCESS, value: distribution.success },
        { status: ValidationStatus.FAILURE, value: distribution.failed },
        // Agrega otros estados si es necesario
    ];

    // Filtrar estados con valor cero para no mostrar en el gráfico
    return data.filter((item) => item.value > 0);
};