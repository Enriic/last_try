// src/utils/documentUtils.ts

import { Validation } from '../types';

export const groupByDocumentType = (validations: Validation[]) => {
    const groups = validations.reduce((acc, val) => {
        const type = val.document_info.document_type_name || "Desconocido";
        if (!acc[type]) {
            acc[type] = { document_type: type, count: 0, approved: 0, rejected: 0 };
        }
        acc[type].count += 1;
        if (val.status === 'success') {
            acc[type].approved += 1;
        } else if (val.status === 'failure') {
            acc[type].rejected += 1;
        }
        return acc;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as any);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Object.values(groups).map((group: any) => ({
        ...group,
        successRate: group.count > 0 ? (group.approved / group.count) * 100 : 0,
    }));
};