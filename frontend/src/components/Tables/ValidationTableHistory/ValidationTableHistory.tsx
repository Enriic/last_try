// src/components/ValidationTable/ValidationTableHistory.tsx

import React from 'react';
import { Table, Button, Spin, Tag } from 'antd';
import { Validation } from '../../../types';
import './ValidationTableHistory.less';
import { useTranslation } from 'react-i18next';

/**
 * Propiedades para el componente de tabla de historial de validaciones
 */
interface ValidationTableHistoryProps {
    /* Lista de validaciones a mostrar */
    validations: Validation[];
    /* Estado de carga de la tabla */
    loading: boolean;
    /* Función para manejar la visualización de detalles de una validación */
    onViewDetails: (validation: Validation) => void;
    /* Configuración de paginación */
    pagination: {
        current: number;
        pageSize: number;
        total: number;
        onChange: (page: number, pageSize?: number) => void;
    };
}

/**
 * Componente para mostrar una tabla con el historial de validaciones de documentos
 */
const ValidationTableHistory: React.FC<ValidationTableHistoryProps> = ({
    validations,
    loading,
    onViewDetails,
    pagination,
}) => {
    /* Hook para acceder a las funciones de traducción */
    const { t } = useTranslation();

    /**
     * Función para renderizar un tag de estado según el resultado de la validación
     */
    const renderTag = (status: string) => {
        if (status === 'success') {
            return <Tag color="green">{t('validationTableHistory.success')}</Tag>;
        } else if (status === 'failure') {
            return <Tag color="red">{t('validationTableHistory.failure')}</Tag>;
        } else {
            return <Tag>{status.toLocaleUpperCase()}</Tag>;
        }

    };

    /* Definición de columnas de la tabla */
    const columns = [
        {
            title: t('validationTableHistory.date'),
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (text: string) => new Date(text).toLocaleDateString(),
        },
        {
            title: t('validationTableHistory.documentName'),
            dataIndex: 'document_name',
            key: 'document_name',
            render: (documentName: string) => documentName,
        },
        {
            title: t('validationTableHistory.documentType'),
            dataIndex: 'document_type_name',
            key: 'document_type_name',
            render: (documentTypeName: string) => documentTypeName,
        },
        {
            title: t('validationTableHistory.result'),
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => renderTag(status),
        },
        {
            key: 'actions',
            /* Columna para acciones, muestra un botón para ver detalles */
            render: (_: any, record: Validation) => (
                <Button type="link" onClick={() => onViewDetails(record)}>
                    {t('validationTableHistory.viewDetails')}
                </Button>
            ),
        },
    ];

    /* Muestra un indicador de carga si los datos están cargando */
    if (loading) {
        return <Spin />;
    }

    /* Renderiza la tabla de validaciones */
    return (
        <Table
            size="middle"
            className="history-validation-table"
            dataSource={validations}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={pagination}
        />
    );
};

export default ValidationTableHistory;