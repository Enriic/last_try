import React, { useEffect, useState } from 'react';
import { Modal, Descriptions, Row, Col } from 'antd';
import { Document } from '../../../types';
import JunoButton from '../../common/JunoButton/JunoButton';
import { useTranslation } from 'react-i18next';
import PDFViewer from '../../PDFViewer/PDFViewer';
import { getDocumentTypeById, handleDownload } from '../../../services/documentService';
import { JunoButtonTypes } from '../../common/JunoButton/JunoButton.types';

{/* 
 * Interfaz para las propiedades del modal de documento duplicado 
 */}
interface DuplicateDocumentModalProps {
    /* Estado de visibilidad del modal */
    visible: boolean;
    /* Datos del documento duplicado */
    documentData: Document;
    /* Función para cerrar el modal */
    onClose: () => void;
    /* Función para usar el documento existente */
    useExistingDocument: () => void;
}

{/* 
 * Componente para el modal de documento duplicado
 * Muestra información sobre un documento duplicado y opciones para gestionarlo
 */}
const DuplicateDocumentModal: React.FC<DuplicateDocumentModalProps> = ({
    visible,
    documentData,
    onClose,
    useExistingDocument,
}) => {
    /* Hook para acceder a las funciones de traducción */
    const { t } = useTranslation();
    /* Estado para controlar la visibilidad del documento duplicado */
    const [isDuplicateDocVisible, setIsDuplicateDocVisible] = useState<boolean>(false);
    /* Estado para almacenar el tipo de documento */
    const [documentType, setDocumentType] = useState<string | null>(null);

    /* Efecto para cargar datos cuando el modal se hace visible */
    useEffect(() => {
        if (visible) {
            fetchData();
        }
    }, [visible]);

    /* Función para obtener el tipo de documento */
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
            width={isDuplicateDocVisible ? '80%' : '50%'}
            style={{ minWidth: '500px' }}
        >
            {isDuplicateDocVisible ? (
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={10} lg={10} xl={8}>
                        <Descriptions
                            bordered
                            column={1}
                            size="small"
                            className="validation-details-description"
                        >
                            <Descriptions.Item
                                label={t('duplicate_document_modal.document_name')}
                            >
                                {documentData.name}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={t('duplicate_document_modal.document_type')}
                            >
                                {documentType}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={t('duplicate_document_modal.upload_date')}
                            >
                                {new Date(documentData.timestamp).toLocaleString()}
                            </Descriptions.Item>
                        </Descriptions>
                        <div style={{ marginTop: 16, textAlign: 'left' }}>
                            <JunoButton
                                type='primary'
                                buttonType={JunoButtonTypes.Ok}
                                onClick={useExistingDocument}
                            >
                                {t('duplicate_document_modal.use_existing_document_button')}
                            </JunoButton>
                        </div>
                    </Col>
                    <Col xs={24} sm={24} md={14} lg={14} xl={16}>
                        <PDFViewer documentId={documentData.id} onDownload={() => handleDownload(documentData.id)} />
                    </Col>
                </Row>
            ) : (
                <>
                    <Descriptions
                        bordered
                        column={1}
                        size="small"
                        className="validation-details-description"
                    >
                        <Descriptions.Item
                            label={t('duplicate_document_modal.document_name')}
                        >
                            {documentData.name}
                        </Descriptions.Item>
                        <Descriptions.Item
                            label={t('duplicate_document_modal.document_type')}
                        >
                            {documentType}
                        </Descriptions.Item>
                        <Descriptions.Item
                            label={t('duplicate_document_modal.upload_date')}
                        >
                            {new Date(documentData.timestamp).toLocaleString()}
                        </Descriptions.Item>
                    </Descriptions>
                    <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                        <JunoButton
                            type='link'
                            buttonType={JunoButtonTypes.Link}
                            onClick={() => setIsDuplicateDocVisible(true)}
                        >
                            {t('duplicate_document_modal.view_document_button')}
                        </JunoButton>
                        <JunoButton
                            type='primary'
                            buttonType={JunoButtonTypes.Ok}
                            onClick={useExistingDocument}
                        >
                            {t('duplicate_document_modal.use_existing_document_button')}
                        </JunoButton>
                    </div>
                </>
            )}
        </Modal>
    );
};

export default DuplicateDocumentModal;