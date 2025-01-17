// src/components/ValidationDetailsModal/ValidationDetailsModal.tsx

import React from 'react';
import { Modal, Table } from 'antd';
import { Validation, Resource, VehicleDetails, EmployeeDetails } from '../../types';
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
            title: 'Valor esperado',
            dataIndex: 'expected_value',
            key: 'expected_value',
        },
        {
            title: 'Valor obtenido',
            dataIndex: 'obtained_value',
            key: 'obtained_value',
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

    const renderOption = (item: Resource) => {
            if (item.resource_type === 'vehicle') {
                const vehicle = item.resource_details as VehicleDetails;
                return `${vehicle.name} - ${vehicle.registration_id}`;
            } else if (item.resource_type === 'employee') {
                const employee = item.resource_details as EmployeeDetails;
                return `${employee.first_name} ${employee.last_name} - ${employee.number_id}`;
            }
            return 'Recurso desconocido';
        };

    return (
        <Modal
            visible={visible}
            title={`Detalles de Validación resource: ${renderOption(validation.document_info.resource_info)}`} // Aqui iria el id del requirement seguramente, o el del trade como mucho, pero mejor el de requirement.
            onCancel={onClose}
            footer={null}
            width={800}
            height={600}
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