// src/components/ValidationDetailsModal/ValidationDetailsModal.tsx

import React, { useEffect, useState } from 'react';
import { Modal, Table, Row, Col, Descriptions, Typography } from 'antd';
import { AlignType } from 'rc-table/lib/interface';
import { Validation, VehicleDetails, EmployeeDetails, ResourceType, Resource, Company } from '../../types';
import PDFViewer from '../PDFViewer/PDFViewer';  // Importa el componente PDFViewer
import './ValidationDetailsModal.less';
import { getResource } from '../../services/resourceService';
import { getDocumentFromBlobContainer, getDocument } from '../../services/documentService'; // Importa la función getDocumentFromBlobContainer
import { useTranslation } from 'react-i18next';
import { render } from 'less';
import { getCompanyById } from '../../services/companyService';

interface ValidationDetailsModalProps {
    visible: boolean;
    validation: Validation;
    onClose: () => void;
}

const ValidationDetailsModal: React.FC<ValidationDetailsModalProps> = ({ visible, validation, onClose }) => {
    const [resource, setResource] = useState<Resource | null>(null);
    const { t } = useTranslation();


    useEffect(() => {
        if (validation.resource_id) {
            fetchData(validation.resource_id);
        }
    }, [validation.resource_id]);

    const columns = [
        {
            title: t('validation_details_modal.columns.field'),
            dataIndex: 'name',
            key: 'name',
            align: 'center' as AlignType,
        },
        {
            title: t('validation_details_modal.columns.obtained_value'),
            dataIndex: 'obtained_value',
            key: 'obtained_value',
            align: 'center' as AlignType,
            render: (value: string) => value || '',
        },
        {
            title: t('validation_details_modal.columns.expected_value'),
            dataIndex: 'expected_value',
            key: 'expected_value',
            align: 'center' as AlignType,
            render: (value: string) => value || '',
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
                    <span className='ant-tag ant-tag-red'>
                        {t('validation_details_modal.result_render.tag.failure')}
                    </span>
                ),
        },
    ];

    const fetchData = async (resourceId?: string) => {
        if (resourceId) {
            const resource = await getResource(resourceId);
            setResource(resource);
            //setCompany(resource.company)
            console.log('validation', validation);
        } else {
            setResource(null);
        }
        // console.log('validation', validation);
        // const company = await getCompanyById(validation.company_id);
        // setCompany(company);
    };

    const renderResourceInfo = () => {
        if (resource?.resource_type === ResourceType.VEHICLE) {
            const vehicle = resource.resource_details as VehicleDetails;
            return `${vehicle.name} - ${vehicle.registration_id}`;
        } else if (resource?.resource_type === ResourceType.EMPLOYEE) {
            const employee = resource.resource_details as EmployeeDetails;
            return `${employee.first_name} ${employee.last_name} - ${employee.worker_id}`;
        }
        return t('validation_details_modal.resource_render.unknown');
    };

    const fieldsToValidate = validation.validation_details.fields_to_validate || [];
    const fieldsToExtract = validation.validation_details.fields_to_extract || [];

    const columnsForExtract = columns.filter(
        (col) => col.key !== 'expected_value' && col.key !== 'result'
    );

    return (
        <Modal
            visible={visible}
            title={`${t('validation_details_modal.title')}`}
            onCancel={onClose}
            footer={null}
            width={'80%'}
            className="validation-details-modal"
        >
            <Row gutter={16} style={{ height: '80%' }}>
                <Col xs={24} md={12} style={{ overflowY: 'auto', paddingRight: '16px' }}>
                    <Descriptions bordered column={1} size="small" className='validation-details-description'>
                        <Descriptions.Item label={t('validation_details_modal.validation_id')} labelStyle={{ color: 'grey'}} className='description-item description-item-validation-id'>
                            {validation.id}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('validation_details_modal.document_name')} labelStyle={{ color: 'grey' }} className='description-item description-item-document-name'>
                            {validation.document_name}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('validation_details_modal.document_type')} labelStyle={{ color: 'grey' }} className='description-item description-item-document-type'>
                            {validation.document_type_name}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('validation_details_modal.resource')} labelStyle={{ color: 'grey' }} className='description-item description-item-resource'>
                            {renderResourceInfo()}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('validation_details_modal.company')} labelStyle={{ color: 'grey' }} className='description-item description-item-company'>
                            {validation.company}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('validation_details_modal.status')} labelStyle={{ color: 'grey' }} className='description-item description-itemstatus'>
                            {validation.status}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('validation_details_modal.timestamp')} labelStyle={{ color: 'grey' }} className='description-item description-itemtimestamp'>
                            {new Date(validation.timestamp).toISOString().replace('T', ' ').split('.')[0]}
                        </Descriptions.Item>
                    </Descriptions>

                    <Typography.Title level={5} style={{ marginTop: '24px', borderBottom: '1px solid #e8e8e8', paddingBottom: '8px', fontWeight: 550 }}>
                        {t('validation_details_modal.validation_fields.title')}
                    </Typography.Title>
                    <Table
                        dataSource={fieldsToValidate}
                        columns={columns}
                        rowKey="name"
                        size='small'
                        pagination={false}
                        className="validation-table tall-rows"
                        style={{ marginTop: '10px' }}
                    />

                    {/* Tabla para Fields to Extract */}
                    <Typography.Title
                        level={5}
                        style={{ marginTop: '24px', borderBottom: '1px solid #e8e8e8', paddingBottom: '8px', fontWeight: 550}}
                    >
                        {t('validation_details_modal.validation_fields.title')}
                    </Typography.Title>
                    <Table
                        dataSource={fieldsToExtract}
                        columns={columnsForExtract}
                        rowKey="name"
                        pagination={false}
                        size='small'
                        className="validation-table tall-rows"
                        style={{ marginTop: '10px' }}
                    />
                </Col>

                {/* Columna derecha: Visor de PDF */}
                <Col xs={24} md={12} style={{ overflowY: 'auto', paddingLeft: '16px' }}>
                    <PDFViewer documentId={validation.document} />
                </Col>
            </Row>
        </Modal>
    );
};

export default ValidationDetailsModal;