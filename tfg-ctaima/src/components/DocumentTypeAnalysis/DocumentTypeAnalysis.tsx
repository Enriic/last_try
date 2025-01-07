// src/components/DocumentTypeAnalysis/DocumentTypeAnalysis.tsx

import React from 'react';
import { Table } from 'antd';
import { Validation } from '../../types';
import { groupByDocumentType } from '../../utils/documentUtils';
import './DocumentTypeAnalysis.less';

interface DocumentTypeAnalysisProps {
    validations: Validation[];
}

const DocumentTypeAnalysis: React.FC<DocumentTypeAnalysisProps> = ({ validations }) => {
    const data = groupByDocumentType(validations);
    console.log(data)

    const columns = [
        {
            title: 'Tipo de Documento',
            dataIndex: 'document_type',
            key: 'document_type',
            
        },
        {
            title: 'Validaciones',
            dataIndex: 'count',
            key: 'count',
        },
        {
            title: 'Aprobadas',
            dataIndex: 'approved',
            key: 'approved',
        },
        {
            title: 'Rechazadas',
            dataIndex: 'rejected',
            key: 'rejected',
        },
        {
            title: 'Tasa de Éxito',
            dataIndex: 'successRate',
            key: 'successRate',
            render: (value: number) => `${value.toFixed(2)}%`,
        },
    ];

    return (
        <Table className='dashboard-table-document-type-analysis'
            columns={columns}
            dataSource={data}
            rowKey="document_type"
            pagination={false}
            title={() => 'Análisis por Tipo de Documento'}
        />
    );
};

export default DocumentTypeAnalysis;