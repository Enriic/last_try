// src/components/ValidationTable/ValidationTable.tsx

import React, { useState } from 'react';
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

    const [pageSize, setPageSize] = useState(10); // Tamaño de página inicial
    const [currentPage, setCurrentPage] = useState(1); // Página actual


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
        // Add this column with resource, look how to that looking first the resource_type
        // {
        //     title: 'Recursos',
        //     dataIndex: 'document_info',
        //     key: 'document_type',
        //     render: (document_info: Document) => document_info?.document_type_info.name,
        // },
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
            size='middle'
            className='history-validation-table'
            dataSource={validations}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
                current: currentPage, // Página actual
                pageSize: pageSize,
                onChange: (page, size) => {
                    setCurrentPage(page); // Actualiza la página actual
                    setPageSize(size || pageSize); // Actualiza el tamaño de página
                },
                showSizeChanger: true, // Muestra el selector de tamaño
                pageSizeOptions: ["10", "20", "50"], // Opciones para cambiar el tamaño de página

            }}
        />
    );
};

export default ValidationTableHistory;