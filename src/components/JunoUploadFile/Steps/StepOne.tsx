import React from 'react';
import { Form, Checkbox, Upload, Button } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import DocumentSelect from '../../common/SearchableSelect/DocumentSelect/DocumentSelect';
import DocumentTypeSelect from '../../common/SearchableSelect/DocumentTypeSelect/DocumentTypeSelect';
import DynamicInputs from '../DynamicForm/DynamicForm';
import { useTranslation } from 'react-i18next';
import { UploadFile } from 'antd/lib/upload/interface';

const { Dragger } = Upload;

/**
 * Interfaz que define las propiedades recibidas por el componente StepOne
 */
interface StepOneProps {
    form: any;                                                  
    t: any;                                                    
    uploading: boolean;                                        
    useExistingDocument: boolean;                             
    uploadedDocument: string | null;                          
    fileList: UploadFile[];                                    
    documentType: number | string | null;                     
    associatedEntities: string[];                             
    companyId: string | null;                                
    resource: string | null;                                  
    handleDocumentTypeChange: (value: number | string | null) => void;  
    handleResourceChange: (value: string | null) => void;      
    handleCompanyChange: (value: string | null) => void;       
    handleExistingDocumentChange: (value: string | null) => void;      
    handleNext: () => void;                                   
    uploadProps: any;                                          
    setUseExistingDocument: (value: boolean) => void;         
    setFileList: (files: UploadFile[]) => void;               
}

/**
 * Componente que representa el primer paso del asistente de carga de documentos
 * Permite elegir entre usar un documento existente o cargar uno nuevo
 */
const StepOne: React.FC<StepOneProps> = ({
    form,
    t,
    uploading,
    useExistingDocument,
    uploadedDocument,
    fileList,
    documentType,
    associatedEntities,
    companyId,
    resource,
    handleDocumentTypeChange,
    handleResourceChange,
    handleCompanyChange,
    handleExistingDocumentChange,
    handleNext,
    uploadProps,
    setUseExistingDocument,
}) => {
    return (
        <>
            {/* Checkbox para elegir entre usar un documento existente o cargar uno nuevo */}
            <Form.Item
                label={t('upload.useExistingDocumentLabel')}
                name="useExistingDocument"
                valuePropName="checked"
            >
                <Checkbox onChange={(e) => setUseExistingDocument(e.target.checked)}>
                    {t('upload.useExistingDocument')}
                </Checkbox>
            </Form.Item>

            {/* Renderizado condicional según la opción seleccionada */}
            {useExistingDocument ? (
                // Formulario para seleccionar un documento existente
                <Form.Item
                    label={t('upload.existingDocumentLabel')}
                    name="existingDocument"
                    rules={[
                        {
                            required: true,
                            message: t('upload.existingDocumentError'),
                        },
                    ]}
                >
                    <DocumentSelect
                        value={uploadedDocument || null}
                        placeholder={t('upload.existingDocumentPlaceholder')}
                        onChange={handleExistingDocumentChange}
                    />
                </Form.Item>
            ) : (
                // Formulario para cargar un nuevo documento
                <>
                    {/* Selección del tipo de documento */}
                    <Form.Item
                        label={t('upload.documentTypeLabel')}
                        name="documentType"
                        rules={[
                            {
                                required: !useExistingDocument,
                                message: t('upload.documentTypeError'),
                            },
                        ]}
                    >
                        <DocumentTypeSelect
                            value={documentType?.toString()}
                            onChange={handleDocumentTypeChange}
                            placeholder={t('upload.documentTypePlaceholder')}
                            disabled={useExistingDocument}
                        />
                    </Form.Item>

                    {/* Componente dinámico que muestra campos adicionales según las entidades asociadas */}
                    <DynamicInputs
                        associatedEntities={associatedEntities}
                        useExistingDocument={useExistingDocument}
                        companyId={companyId}
                        resource={resource}
                        handleCompanyChange={handleCompanyChange}
                        handleResourceChange={handleResourceChange}
                    />

                    {/* Componente de carga de archivos */}
                    <Form.Item
                        label={t('upload.fileLabel')}
                        name="file"
                        rules={[
                            {
                                required: !useExistingDocument,
                                message: t('upload.fileError'),
                            },
                        ]}
                    >
                        <Dragger
                            {...uploadProps}
                            maxCount={1}                       // Limita a un único archivo
                            className="upload-dragger"
                            disabled={useExistingDocument}
                        >
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            {/* Mensaje dinámico según si hay archivo seleccionado o no */}
                            {fileList.length === 0 ? (
                                <p className="ant-upload-text">{t('upload.uploadPrompt')}</p>
                            ) : (
                                <p className="ant-upload-text">
                                    {t('upload.selectedFile')}: <strong>{fileList[0].name}</strong>
                                </p>
                            )}
                        </Dragger>
                    </Form.Item>
                </>
            )}

            {/* Botón para avanzar al siguiente paso */}
            <Form.Item>
                <Button type="primary" onClick={handleNext}>
                    {/* Texto del botón cambia según el contexto */}
                    {useExistingDocument
                        ? t('upload.continueButton')
                        : uploading
                            ? t('upload.uploading')
                            : t('upload.uploadButton')}
                </Button>
            </Form.Item>
        </>
    );
};

export default StepOne;