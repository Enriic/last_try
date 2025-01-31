// src/components/ValidationResultModal/ValidationResultModal.tsx

import React from 'react';
import { Modal, Descriptions, List, Tag } from 'antd';
import { FieldToExtract, ValidationResultField } from '../../types';
import dayjs from 'dayjs';
import './ValidationResultModel.less';
import { useTranslation } from 'react-i18next';

interface ValidationResultModalProps {
    visible: boolean;
    onClose: () => void;
    documentName: string;
    documentType: string;
    validationResult: string;
    timestamp: string;
    fields_to_validate: ValidationResultField[];
    fields_to_extract: FieldToExtract[];
}

const ValidationResultModal: React.FC<ValidationResultModalProps> = ({
    visible,
    onClose,
    documentName,
    documentType,
    validationResult,
    timestamp,
    fields_to_validate,
    fields_to_extract
}) => {
    const { t } = useTranslation();

    const renderTag = (status: string) => {
        let color = '';
        let text = '';

        if (status === 'success') {
            color = 'green';
            text = t('validationResultModal.success');
        } else if (status === 'failure') {
            color = 'red';
            text = t('validationResultModal.failure');
        } else {
            text = t('validationResultModal.pending');
        }

        return <Tag color={color}>{text}</Tag>;
    };

    return (
        <Modal
            open={visible}
            title={t('validationResultModal.title')}
            onCancel={onClose}
            footer={null}
        >
            <Descriptions bordered column={1} className='modal-description'>
                <Descriptions.Item
                    className='modal-description-item'
                    label={t('validationResultModal.documentName')}
                    labelStyle={{ color: 'black', fontSize: 15 }}
                >
                    {documentName}
                </Descriptions.Item>
                <Descriptions.Item
                    className='modal-description-item'
                    label={t('validationResultModal.documentType')}
                    labelStyle={{ color: 'black', fontSize: 15 }}
                >
                    {documentType}
                </Descriptions.Item>
                <Descriptions.Item
                    className='modal-description-item'
                    label={t('validationResultModal.validationResult')}
                    labelStyle={{ color: 'black', fontSize: 15 }}
                >
                    {renderTag(validationResult)}
                </Descriptions.Item>
                <Descriptions.Item
                    className='modal-description-item'
                    label={t('validationResultModal.dateTime')}
                    labelStyle={{ color: 'black', fontSize: 15 }}
                >
                    {dayjs(timestamp).format('DD/MM/YYYY HH:mm:ss')}
                </Descriptions.Item>
            </Descriptions>

            {/*  */}

            <List
                header={<h4 style={{ marginTop: '16px', fontSize:18 }}>{t('validationResultModal.validationFields')}</h4>}
                dataSource={fields_to_validate}
                renderItem={(item) => (
                    <List.Item className='modal-list-item'>
                        <List.Item.Meta
                            title={<span className="item-title">{item.name.toUpperCase()}</span>}
                            description={renderTag(item.result)}
                        />
                    </List.Item>
                )}
            />

            <List
                header={<h4 style={{ marginTop: '16px', fontSize: 18 }}>{t('validationResultModal.extractionFields')}</h4>}
                dataSource={fields_to_extract}
                renderItem={(item) => (
                    <List.Item className='modal-list-item'>
                        <List.Item.Meta
                            title={<span className="item-title">{item.name.toUpperCase()}</span>}
                            description={
                                <span className={`ant-tag ${item.value === 'success' ? 'ant-tag-green' : 'ant-tag-red'}`}>
                                    {item.value || t('validationResultModal.pending')}
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