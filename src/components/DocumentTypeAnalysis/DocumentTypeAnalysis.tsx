// src/components/DocumentTypeAnalysis/DocumentTypeAnalysis.tsx

import React from 'react';
import { Table } from 'antd';
import { Validation } from '../../types';
import { groupByDocumentType } from '../../utils/documentUtils';
import { useTranslation } from 'react-i18next'; // Importa el hook de traducción
import './DocumentTypeAnalysis.less';

interface DocumentTypeAnalysisProps {
    validations: Validation[];
}

const DocumentTypeAnalysis: React.FC<DocumentTypeAnalysisProps> = ({ validations }) => {
    const { t } = useTranslation(); // Obtiene la función de traducción
    const data = groupByDocumentType(validations);
    console.log(data)

    const columns = [
        {
            title: t('documentTypeAnalysis.documentType'), // 'Tipo de Documento'
            dataIndex: 'document_type',
            key: 'document_type',
        },
        {
            title: t('documentTypeAnalysis.validations'), // 'Validaciones'
            dataIndex: 'count',
            key: 'count',
        },
        {
            title: t('documentTypeAnalysis.approved'), // 'Aprobadas'
            dataIndex: 'approved',
            key: 'approved',
        },
        {
            title: t('documentTypeAnalysis.rejected'), // 'Rechazadas'
            dataIndex: 'rejected',
            key: 'rejected',
        },
        {
            title: t('documentTypeAnalysis.successRate'), // 'Tasa de Éxito'
            dataIndex: 'successRate',
            key: 'successRate',
            render: (value: number) => `${value.toFixed(2)}%`,
        },
    ];

    return (
        <Table
            className='dashboard-table-document-type-analysis'
            columns={columns}
            dataSource={data}
            rowKey="document_type"
            pagination={false}
            title={() => t('documentTypeAnalysis.analysisTitle')} // 'Análisis por Tipo de Documento'
        />
    );
};

export default DocumentTypeAnalysis;