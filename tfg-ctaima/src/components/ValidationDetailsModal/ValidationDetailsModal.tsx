// src/components/ValidationDetailsModal/ValidationDetailsModal.tsx

import React, { useEffect, useState } from 'react';
import { Modal, Table } from 'antd';
import { AlignType } from 'rc-table/lib/interface';
import { Validation, VehicleDetails, EmployeeDetails, ResourceType, Resource } from '../../types';
import './ValidationDetailsModal.less';
import { getResource } from '../../services/resourceService';


interface ValidationDetailsModalProps {
    visible: boolean;
    validation: Validation;
    onClose: () => void;
}

const ValidationDetailsModal: React.FC<ValidationDetailsModalProps> = ({ visible, validation, onClose}) => {
    const [resource, setResource] = useState<Resource | null>(null);
    
    useEffect(() => {
        fetchData(validation.resource_id);
    }, []);
    
    const columns = [
        {
            title: 'Campo',
            dataIndex: 'name',
            key: 'name',
            align: 'center' as AlignType
        },
        {
            title: 'Valor obtenido',
            dataIndex: 'obtained_value',
            key: 'obtained_value',
            align: 'center' as AlignType,
            render: (value: string) => value || ''
        },
        {
            title: 'Valor esperado',
            dataIndex: 'expected_value',
            key: 'expected_value',
            align: 'center' as AlignType,
            render: (value: string) => value || ''
        },

        {
            title: 'Resultado',
            dataIndex: 'result',
            key: 'result',
            align: 'center' as AlignType,
            render: (result: string) =>
                result === 'success' ? (
                    <span className='ant-tag ant-tag-green'>Correcto</span>
                ) : (
                    <span className='ant-tag ant-tag-red' style={{ color: 'red' }}>
                        Incorrecto
                    </span>
                )
        }
    ];

    const fetchData = async (resourceId: string) => {
        const resource = await getResource(resourceId);
        setResource(resource);
    };

    const renderOption = () => {

        if (resource?.resource_type === ResourceType.VEHICLE) {
            const vehicle = resource.resource_details as VehicleDetails;
            console.log(vehicle.name)
                return `${vehicle.name} - ${vehicle.registration_id}`;
            } else if (resource?.resource_type === ResourceType.EMPLOYEE) {
            const employee = resource.resource_details as EmployeeDetails;
            console.log(employee.worker_id)

                return `${employee.first_name} ${employee.last_name} - ${employee.worker_id}`;
            }
        return 'Recurso desconocido';
    };

    const fieldsToValidate = validation.validation_details.fields_to_validate || [];
    const fieldsToExtract = validation.validation_details.fields_to_extract || [];

    const columnsForExtract = [...columns]
    columnsForExtract.pop()
    columnsForExtract.pop()


    return (
        <Modal
            visible={visible}
            title={`Detalles de Validación recurso: ${renderOption()}`}
            onCancel={onClose}
            footer={null}
            width={800}
            height={600}
        >
            {/* Tabla para Fields to Validate */}
            <h3 style={{marginTop:20}}>Campos para Validar</h3>
            <Table
                dataSource={fieldsToValidate}
                columns={columns}
                rowKey="name"
                pagination={false}
            />

            {/* Tabla para Fields to Extract */}
            <h3 style={{ marginTop: 20 }}>Campos para Extraer</h3>
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
