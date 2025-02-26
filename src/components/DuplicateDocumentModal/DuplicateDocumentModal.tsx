// src/components/DuplicateDocumentModal/DuplicateDocumentModal.tsx

import React, { useEffect, useState } from 'react';
import { Modal, Descriptions, Row, Col } from 'antd';
import { Document } from '../../types';
import JunoButton from '../common/JunoButton';
import { useTranslation } from 'react-i18next';
import PDFViewer from '../PDFViewer/PDFViewer';
import { getDocumentTypeById, handleDownload } from '../../services/documentService';
import { JunoButtonTypes } from '../common/JunoButton/JunoButton.types';

interface DuplicateDocumentModalProps {
    visible: boolean;
    documentData: Document;
    onClose: () => void;
    useExistingDocument: () => void;
}

const DuplicateDocumentModal: React.FC<DuplicateDocumentModalProps> = ({
    visible,
    documentData,
    onClose,
    useExistingDocument,
}) => {
    const { t } = useTranslation();
    const [isDuplicateDocVisible, setIsDuplicateDocVisible] = useState<boolean>(false);
    const [documentType, setDocumentType] = useState<string | null>(null);

    useEffect(() => {
        if (visible) {
            fetchData();
        }
    }, [visible]);

    const fetchData = async () => {
        try {
            const docType = await getDocumentTypeById(documentData.document_type);
            setDocumentType(docType.name);
        } catch (error) {
            console.error('Error fetching document type:', error);
        }
    };

    return (
        <Modal
            visible={visible}
            title={t('duplicate_document_modal.title')}
            onCancel={onClose}
            footer={null}
            // Se puede ajustar el ancho según si se muestra el documento o no.
            width={isDuplicateDocVisible ? '80%' : '50%'}
            style={{ minWidth: '500px' }}
        >
            {isDuplicateDocVisible ? (
                // Layout cuando se muestra el documento: dos columnas responsivas
                <Row gutter={[16, 16]}>
                    {/* Columna izquierda: información y botón */}
                    <Col xs={24} sm={24} md={10} lg={10} xl={8}>
                        <Descriptions
                            bordered
                            column={1}
                            size="small"
                            className="validation-details-description"
                        >
                            <Descriptions.Item
                                label={t('duplicate_document_modal.document_name')}
                                labelStyle={{ color: 'grey' }}
                            >
                                {documentData.name}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={t('duplicate_document_modal.document_type')}
                                labelStyle={{ color: 'grey' }}
                            >
                                {documentType}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={t('duplicate_document_modal.upload_date')}
                                labelStyle={{ color: 'grey' }}
                            >
                                {new Date(documentData.timestamp).toLocaleString()}
                            </Descriptions.Item>
                        </Descriptions>
                        <div style={{ marginTop: 16, textAlign: 'left' }}>
                            <JunoButton
                                type="primary"
                                buttonType={JunoButtonTypes.Ok}
                                onClick={useExistingDocument}
                            >
                                {t('duplicate_document_modal.use_existing_document_button')}
                            </JunoButton>
                        </div>
                    </Col>
                    {/* Columna derecha: preview del documento */}
                    <Col xs={24} sm={24} md={24} lg={24} xl={16} style={{ overflowY: 'auto', height: '100%' }}>
                        <PDFViewer documentId={documentData.id} onDownload={async () => await handleDownload(documentData.id)}/>
                    </Col>
                </Row>
            ) : (
                // Layout cuando NO se muestra el documento: elementos en filas separadas
                <>
                    <Row gutter={[16, 16]}>
                        <Col xs={24}>
                            <Descriptions
                                bordered
                                column={1}
                                size="small"
                                className="validation-details-description"
                            >
                                <Descriptions.Item
                                    label={t('duplicate_document_modal.document_name')}
                                    labelStyle={{ color: 'grey' }}
                                >
                                    {documentData.name}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={t('duplicate_document_modal.document_type')}
                                    labelStyle={{ color: 'grey' }}
                                >
                                    {documentType}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={t('duplicate_document_modal.upload_date')}
                                    labelStyle={{ color: 'grey' }}
                                >
                                    {new Date(documentData.timestamp).toLocaleString()}
                                </Descriptions.Item>
                            </Descriptions>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        <Col xs={24} style={{ textAlign: 'left' }}>
                            <JunoButton
                                type="link"
                                buttonType={JunoButtonTypes.Link}
                                onClick={() => setIsDuplicateDocVisible(true)}
                            >
                                {t('duplicate_document_modal.view_document_button')}
                            </JunoButton>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        <Col xs={24} style={{ textAlign: 'left' }}>
                            <JunoButton
                                type="primary"
                                buttonType={JunoButtonTypes.Ok}
                                onClick={useExistingDocument}
                            >
                                {t('duplicate_document_modal.use_existing_document_button')}
                            </JunoButton>
                        </Col>
                    </Row>
                </>
            )}
        </Modal>
    );
};

export default DuplicateDocumentModal;
