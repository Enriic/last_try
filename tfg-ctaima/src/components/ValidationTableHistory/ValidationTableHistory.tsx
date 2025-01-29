// src/components/ValidationTable/ValidationTable.tsx

import React from 'react';
import { Table, Button, Spin } from 'antd';
import { Validation } from '../../types';
import './ValidationTableHistory.less';

interface ValidationTableHistoryProps {
    validations: Validation[];
    loading: boolean;
    onViewDetails: (validation: Validation) => void;
    pagination: {
        current: number;
        pageSize: number;
        total: number;
        onChange: (page: number, pageSize?: number) => void;
    };
}

const ValidationTableHistory: React.FC<ValidationTableHistoryProps> = ({
    validations,
    loading,
    onViewDetails,
    pagination,
}) => {

    const columns = [
        {
            title: 'Fecha',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (text: string) => new Date(text).toLocaleDateString('es-ES')
        },

        {
            title: 'Nombre del Documento',
            dataIndex: 'document_name',
            key: 'document_name',
            render: (documentName: string) => documentName
        },

        {
            title: 'Tipo de Documento',
            dataIndex: 'document_type_name',
            key: 'document_type_name',
            render: (documentTypeName: string) => documentTypeName
        },

        {
            title: 'Resultado',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) =>
                status === 'success' ? (
                    <span className="ant-tag ant-tag-green">Éxito</span>
                ) : (
                    <span className="ant-tag ant-tag-red">Fallo</span>
                ),
        },

        {
            title: 'Acciones',
            key: 'actions',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render: (_: any, record: Validation) => (
                <Button type="link" onClick={() => onViewDetails(record)}>
                    Ver Detalles
                </Button>
            ),
        },
    ];

    if (loading) {
        return <Spin />;
    }

    return (
        <Table
            size='middle'
            className='history-validation-table'
            dataSource={validations}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={pagination}
        />
    );
};

export default ValidationTableHistory;