// src/components/ValidationResultModal/ValidationResultModal.tsx

import React from 'react';
import { Modal, Descriptions, List } from 'antd';
import { Field } from '../../types';
import dayjs from 'dayjs';
import './ValidationResultModel.less';

interface ValidationResultModalProps {
    visible: boolean;
    onClose: () => void;
    documentName: string;
    documentType: string;
    validationResult: string;
    timestamp: string;
    fields: Field[];
}

const ValidationResultModal: React.FC<ValidationResultModalProps> = ({
    visible,
    onClose,
    documentName,
    documentType,
    validationResult,
    timestamp,
    fields,
}) => {
    return (
        <Modal
            open={visible}
            title="Resultado de la Validación"
            onCancel={onClose}
            footer={null}
        >
            <Descriptions bordered column={1} className='modal-description'>
                <Descriptions.Item className='modal-description-item' label="Nombre del Documento" labelStyle={{ color: 'black', fontSize: 15 }}>{documentName}</Descriptions.Item>
                <Descriptions.Item className='modal-description-item' label="Tipo de Documento" labelStyle={{ color: 'black', fontSize: 15 }}>{documentType}</Descriptions.Item>
                <Descriptions.Item className='modal-description-item' label="Resultado de la Validación" labelStyle={{ color: 'black', fontSize: 15 }}>
                    <span className={`ant-tag ${validationResult === 'Success' ? 'ant-tag-green' : 'ant-tag-red'}`}>
                        {validationResult}
                    </span>
                </Descriptions.Item>
                <Descriptions.Item className='modal-description-item' label="Fecha y Hora" labelStyle={{ color: 'black', fontSize:15 }}>{dayjs(timestamp).format('DD/MM/YYYY HH:mm:ss')}</Descriptions.Item>
            </Descriptions>

            <h3 style={{ marginTop: '16px', fontSize: 20 }}>Detalles de los Campos</h3>
            <List
                dataSource={fields}
                renderItem={(item) => (
                    <List.Item className='modal-list-item'>
                        <List.Item.Meta
                            title={<span className="item-title">{item.name.toUpperCase()}</span>}
                            description={
                                <span className={`ant-tag ${item.value==='success' ? 'ant-tag-green' : 'ant-tag-red'}`}>
                                    {item.value || 'Pendiente'}
                                </span>
                            }
                        />
                    </List.Item>
                )}
            />
        </Modal>
    );
};

export default ValidationResultModal;