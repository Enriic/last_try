// src/components/ValidationTable/ValidationTable.tsx

import React from 'react';
import { Table, Button } from 'antd';
import { Validation } from '../../types';
import { Document } from '../../types';
import './ValidationTableHistory.less';

interface ValidationTableHistoryProps {
    validations: Validation[];
    loading: boolean;
    onViewDetails: (validation: Validation) => void;
}

const ValidationTableHistory: React.FC<ValidationTableHistoryProps> = ({ validations, loading, onViewDetails }) => {
    const columns = [
        {
            title: 'Fecha',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (text: string) => new Date(text).toLocaleDateString('es-ES'),
            sorter: (a: Validation, b: Validation) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
            defaultSortOrder: 'descend' as const,
        },
        {
            title: 'Nombre del Documento',
            dataIndex: 'document_info', 
            key: 'document_id',
            render: (document_info: Document) => document_info?.name, 
        },
        {
            title: 'Tipo de Documento',
            dataIndex: 'document_info',
            key: 'document_type',
            render: (document_info: Document) => document_info?.document_type_info.name,
        },
        {
            title: 'Resultado',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) =>
                status === 'success' ? (
                    <span className='ant-tag ant-tag-green' >Éxito</span>
                ) : (
                    <span className='ant-tag ant-tag-red'>Fallo</span>
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

    return (
        <Table
            className='history-validation-table'
            dataSource={validations}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
        />
    );
};

export default ValidationTableHistory;