// src/components/ValidationDetailsModal/ValidationDetailsModal.tsx

import React from 'react';
import { Modal, Table } from 'antd';
import { AlignType } from 'rc-table/lib/interface';
import { Validation, Resource, VehicleDetails, EmployeeDetails } from '../../types';
import './ValidationDetailsModal.less';

// eslint-disable-next-line @typescript-eslint/no-unused-expressions


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
            align: 'center' as AlignType,
        },
        {
            title: 'Valor obtenido',
            dataIndex: 'obtained_value',
            key: 'obtained_value',
            align: 'center' as AlignType,
            render: (value: string) => value || '',  // Si no hay valor, mostrar vacío
        },
        {
            title: 'Valor esperado',
            dataIndex: 'expected_value',
            key: 'expected_value',
            align: 'center' as AlignType,
            render: (value: string) => value || '',  // Si no hay valor, mostrar vacío
        },
       
        {
            title: 'Resultado',
            dataIndex: 'result',
            key: 'result',
            align: 'center' as AlignType,
            render: (result: string) =>
                result === 'Success' ? (
                    <span className='ant-tag ant-tag-green'>Correcto</span>
                ) : (
                    <span className='ant-tag ant-tag-red' style={{ color: 'red' }}>
                        Incorrecto
                    </span>
                ),
        },
    ];

    const renderOption = (item: Resource) => {
        if (item.resource_type === 'vehicle') {
            const vehicle = item.resource_details as VehicleDetails;
            return `${vehicle.name} - ${vehicle.registration_id}`;
        } else if (item.resource_type === 'employee') {
            const employee = item.resource_details as EmployeeDetails;
            return `${employee.first_name} ${employee.last_name} - ${employee.worker_id}`;
        }
        return 'Recurso desconocido';
    };

    // Combina los campos de validación y extracción en un solo objeto
    const fieldsToValidate = validation.validation_details.fields_to_validate || [];
    const fieldsToExtract = validation.validation_details.fields_to_extract || [];

    const columnsForExtract = [...columns]
    columnsForExtract.pop()
    columnsForExtract.pop()
    

    return (
        <Modal
            visible={visible}
            title={`Detalles de Validación recurso: ${renderOption(validation.document_info.resource_info)}`}
            onCancel={onClose}
            footer={null}
            width={800}
            height={600}
        >
            {/* Tabla para Fields to Validate */}
            <h3 >Campos para Validar</h3>
            <Table
                dataSource={fieldsToValidate}
                columns={columns}
                rowKey="name"
                pagination={false}
            />

            {/* Tabla para Fields to Extract */}
            <h3 style={{marginTop: 20}}>Campos para Extraer</h3>
            <Table
                dataSource={fieldsToExtract}
                columns={columnsForExtract}
                rowKey="name"
                pagination={false}
            />
        </Modal>
    );
};

export default ValidationDetailsModal;
