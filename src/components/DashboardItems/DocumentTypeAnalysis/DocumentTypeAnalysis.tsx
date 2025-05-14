// src/components/DashboardItems/DocumentTypeAnalysis/DocumentTypeAnalysis.tsx

import React from 'react';
import { Table } from 'antd';
import { Validation } from '../../../types';
import { groupByDocumentType } from '../../../utils/documentUtils';
import { useTranslation } from 'react-i18next';
import './DocumentTypeAnalysis.less';

/**
 * Props para el componente DocumentTypeAnalysis
 */
interface DocumentTypeAnalysisProps {
    /** Array de validaciones para analizar por tipo de documento */
    validations: Validation[];
    loading?: boolean;
}

/**
 * Componente que muestra una tabla de análisis de validaciones por tipo de documento
 * 
 * Presenta estadísticas detalladas de validaciones agrupadas por tipo de documento,
 * incluyendo conteo total, aprobadas, rechazadas y tasa de éxito.
 */
const DocumentTypeAnalysis: React.FC<DocumentTypeAnalysisProps> = ({ validations, loading }) => {
    // Obtiene la función de traducción para internacionalización
    const { t } = useTranslation();

    // Procesa los datos de validación para agruparlos por tipo de documento
    const data = groupByDocumentType(validations);

    /**
     * Configuración de columnas para la tabla de análisis
     * Define la estructura y formato de visualización de datos
     */
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
            // Formatea el valor numérico como porcentaje con dos decimales
            render: (value: number) => `${value.toFixed(2)}%`,
        },
    ];

    return (
        <Table
            loading={loading}       // Muestra un indicador de carga mientras se obtienen los datos
            className='dashboard-table-document-type-analysis'
            columns={columns}
            dataSource={data}
            rowKey="document_type" // Usa el tipo de documento como clave única de fila
            pagination={false}     // Deshabilita la paginación para mostrar todos los tipos de documento
            title={() => t('documentTypeAnalysis.analysisTitle')} // 'Análisis por Tipo de Documento'
        />
    );
};

export default DocumentTypeAnalysis;