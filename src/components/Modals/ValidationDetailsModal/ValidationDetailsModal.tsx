// src/components/ValidationDetailsModal/ValidationDetailsModal.tsx

import React, { useEffect, useState } from 'react';
import { Modal, Table, Row, Col, Descriptions, Typography } from 'antd';
import { AlignType } from 'rc-table/lib/interface';
import { Validation, VehicleDetails, EmployeeDetails, ResourceType, Resource } from '../../../types';
import PDFViewer from '../../PDFViewer/PDFViewer';  // Importa el componente PDFViewer
import './ValidationDetailsModal.less';
import { getResource } from '../../../services/resourceService';
import { handleDownload } from '../../../services/documentService'; // Importa la función getDocumentFromBlobContainer
import { useTranslation } from 'react-i18next';

{/* Interfaz para las propiedades del modal de detalles de validación */ }
interface ValidationDetailsModalProps {
    /* Estado de visibilidad del modal */
    visible: boolean;
    /* Datos de la validación */
    validation: Validation;
    /* Función para cerrar el modal */
    onClose: () => void;
}

{/* Componente para el modal de detalles de validación */ }
const ValidationDetailsModal: React.FC<ValidationDetailsModalProps> = ({ visible, validation, onClose }) => {
    /* Estado para almacenar el recurso asociado a la validación */
    const [resource, setResource] = useState<Resource | null>(null);
    /* Hook para acceder a las funciones de traducción */
    const { t } = useTranslation();

    /* Efecto para cargar los datos del recurso cuando cambia el ID del recurso en la validación */
    useEffect(() => {
        if (validation.resource_id) {
            fetchData(validation.resource_id);
        }
    }, [validation.resource_id]);

    /* Columnas de la tabla para mostrar los campos de validación */
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
        }
    ];

    /* Función para obtener los datos del recurso */
    const fetchData = async (resourceId?: string) => {
        if (resourceId) {
            const resource = await getResource(resourceId);
            setResource(resource);
            console.log('validation', validation);
        } else {
            setResource(null);
        }
    };

    /* Función para renderizar la información del recurso */
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

    /* Campos a validar y a extraer de la validación */
    const fieldsToValidate = validation.validation_details.fields_to_validate || [];
    const fieldsToExtract = validation.validation_details.fields_to_extract || [];

    /* Columnas para la tabla de campos a extraer */
    const columnsForExtract = columns.filter(
        (col) => col.key !== 'expected_value' && col.key !== 'result'
    );

    return (
        <Modal
            open={visible}
            title={`${t('validation_details_modal.title')}`}
            onCancel={onClose}
            footer={null}
            width={'80%'}
            className="validation-details-modal"
        >
            <Row gutter={16} style={{ height: '80%' }}>
                <Col xs={24} md={12} style={{ overflowY: 'auto', paddingRight: '16px' }}>
                    <Descriptions bordered column={1} size="small" className='validation-details-description'>
                        <Descriptions.Item label={t('validation_details_modal.validation_id')} labelStyle={{ color: 'grey' }} className='description-item description-item-validation-id'>
                            {validation.id}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('validation_details_modal.document_name')} labelStyle={{ color: 'grey' }} className='description-item description-item-document-name'>
                            {validation.document_name}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('validation_details_modal.document_type')} labelStyle={{ color: 'grey' }} className='description-item description-item-document-type'>
                            {validation.document_type_name}
                        </Descriptions.Item>
                        {/* Mostrar recurso solo si existe */}
                        {resource && (
                            <Descriptions.Item label={t('validation_details_modal.resource')} labelStyle={{ color: 'grey' }} className='description-item description-item-resource'>
                                {renderResourceInfo()}
                            </Descriptions.Item>
                        )}

                        <Descriptions.Item label={t('validation_details_modal.company')} labelStyle={{ color: 'grey' }} className='description-item description-item-company'>
                            {validation.company}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('validation_details_modal.status')} labelStyle={{ color: 'grey' }} className='description-item description-itemstatus'>
                            <span style={{ color: validation.status === 'success' ? '#43b664d9' : 'red', fontWeight: 600 }} >
                                {t(`validation_details_modal.status_options.${validation.status.toLowerCase()}`)}
                            </span>
                        </Descriptions.Item>

                        {/* Mostrar justificación solo si existe */}
                        {validation.justification && (
                            <Descriptions.Item label={t('validation_details_modal.justification')} labelStyle={{ color: 'grey' }} className='description-item description-item-justification'>
                                {validation.justification}
                            </Descriptions.Item>
                        )}

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
                        style={{ marginTop: '24px', borderBottom: '1px solid #e8e8e8', paddingBottom: '8px', fontWeight: 550 }}
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
                    <PDFViewer documentId={validation.document} onDownload={async () => await handleDownload(validation.document)} />
                </Col>
            </Row>
        </Modal>
    );
};

export default ValidationDetailsModal;