// src/components/ValidationDetailsModal/ValidationDetailsModal.tsx

import React from 'react';
import { Modal, Table } from 'antd';
import { Validation } from '../../types';
import './ValidationDetailsModal.less';

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
                    <span className='ant-tag ant-tag-green'>Correcto</span>
                ) : (
                    <span className='ant-tag ant-tag-red 'style={{ color: 'red' }}>Incorrecto</span>
                ),
        },
    ];

    return (
        <Modal
            visible={visible}
            title={`Detalles de Validación Requirement - ${validation.id}`} // Aqui iria el id del requirement seguramente, o el del trade como mucho, pero mejor el de requirement.
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