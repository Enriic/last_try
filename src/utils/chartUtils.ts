// src/utils/chartUtils.ts

import { Validation, ValidationStatus } from '../types';
import moment from 'moment';


type DistributionEntry = {
    status: Validation["status"];
    value: number;
};

export const groupValidationsByMonth = (validations: Validation[]) => {
    const months = Array.from({ length: 12 }, (_, i) => ({
        month: moment().month(i).format('MMMM'),
        validations: 0,
    }));

    validations.forEach((validation) => {
        const monthIndex = moment(validation.timestamp).month();
        months[monthIndex].validations += 1;
    });

    return months;
};


export const calculateValidationDistribution = (validations: Validation[]): DistributionEntry[] => {
    console.log('Calculating validation distribution with validations:', validations);
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
        { status: ValidationStatus.FAILURE  , value: distribution.failed },
        // Agrega otros estados si es necesario
    ];

    // Filtrar estados con valor cero para no mostrar en el gráfico
    return data.filter((item) => item.value > 0);
};