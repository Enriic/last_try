// src/components/ValidationDetailsModal/ValidationDetailsModal.tsx

import React from 'react';
import { Modal, Table } from 'antd';
import { Validation } from '../../types';

interface ValidationDetailsModalProps {
    visible: boolean;
    validation: Validation;
    onClose: () => void;
}

const ValidationDetailsModal: React.FC<ValidationDetailsModalProps> = ({ visible, validation, onClose }) => {
    const columns = [
        {
            title: 'Campo',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Resultado',
            dataIndex: 'result',
            key: 'result',
            render: (result: string) =>
                result === 'Success' ? (
                    <span style={{ color: 'green' }}>Correcto</span>
                ) : (
                    <span style={{ color: 'red' }}>Incorrecto</span>
                ),
        },
    ];

    return (
        <Modal
            visible={visible}
            title={`Detalles de Validación - ${validation.document_name}`}
            onCancel={onClose}
            footer={null}
        >
            <Table
                dataSource={validation.validation_details}
                columns={columns}
                rowKey="name"
                pagination={false}
            />
        </Modal>
    );
};

export default ValidationDetailsModal;