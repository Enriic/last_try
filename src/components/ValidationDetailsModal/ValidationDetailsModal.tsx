// src/components/ValidationDetailsModal/ValidationDetailsModal.tsx

import React, { useEffect, useState } from 'react';
import { Modal, Table } from 'antd';
import { AlignType } from 'rc-table/lib/interface';
import { Validation, VehicleDetails, EmployeeDetails, ResourceType, Resource } from '../../types';
import './ValidationDetailsModal.less';
import { getResource } from '../../services/resourceService';
import { useTranslation } from 'react-i18next';


interface ValidationDetailsModalProps {
    visible: boolean;
    validation: Validation;
    onClose: () => void;
}

const ValidationDetailsModal: React.FC<ValidationDetailsModalProps> = ({ visible, validation, onClose }) => {
    const [resource, setResource] = useState<Resource | null>(null);
    const { t, i18n } = useTranslation();


    useEffect(() => {
        fetchData(validation.resource_id);
    }, []);

    const columns = [
        {
            title: t('validation_details_modal.columns.field'),
            dataIndex: 'name',
            key: 'name',
            align: 'center' as AlignType
        },
        {
            title: t('validation_details_modal.columns.obtained_value'),
            dataIndex: 'obtained_value',
            key: 'obtained_value',
            align: 'center' as AlignType,
            render: (value: string) => value || ''
        },
        {
            title: t('validation_details_modal.columns.expected_value'),
            dataIndex: 'expected_value',
            key: 'expected_value',
            align: 'center' as AlignType,
            render: (value: string) => value || ''
        },

        {
            title: t('validation_details_modal.columns.result'),
            dataIndex: 'result',
            key: 'result',
            align: 'center' as AlignType,
            render: (result: string) =>
                result === 'success' ? (
                    <span className='ant-tag ant-tag-green'>
                        {t('validation_details_modal.result_render.tag.success')}
                    </span>
                ) : (
                    <span className='ant-tag ant-tag-red' style={{ color: 'red' }}>
                        {t('validation_details_modal.result_render.tag.success')}
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
        return t('validation_details_modal.resource_render_unknown');
    };

    const fieldsToValidate = validation.validation_details.fields_to_validate || [];
    const fieldsToExtract = validation.validation_details.fields_to_extract || [];

    const columnsForExtract = [...columns]
    columnsForExtract.pop()
    columnsForExtract.pop()


    return (
        <Modal
            visible={visible}
            title={`${t('validation_details_modal.title')} ${renderOption()}`}
            onCancel={onClose}
            footer={null}
            width={800}
            height={600}
        >
            {/* Tabla para Fields to Validate */}
            <h3 style={{ marginTop: 20 }}>{t('validation_details_modal.validation_fields.title') }</h3>
            <Table
                dataSource={fieldsToValidate}
                columns={columns}
                rowKey="name"
                pagination={false}
            />

            {/* Tabla para Fields to Extract */}
            <h3 style={{ marginTop: 20 }}>{t('validation_details_modal.extraction_fields.title')}</h3>
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
