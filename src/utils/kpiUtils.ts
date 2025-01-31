// src/utils/kpiUtils.ts

import { Validation } from '../types';

export const calculateKPIs = (validations: Validation[]) => {
    const totalValidations = validations.length;
    const approved = validations.filter(v => v.status === 'success').length;
    const rejected = validations.filter(v => v.status === 'failure').length;
    const successRate = totalValidations > 0 ? (approved / totalValidations) * 100 : 0;
    const averageValidationTime =
        totalValidations > 0
            ? validations.reduce((acc, v) => acc + (v.validation_time || 0), 0) / totalValidations
            : 0;

    return {
        totalValidations,
        approved,
        rejected,
        successRate,
        averageValidationTime,
    };
};