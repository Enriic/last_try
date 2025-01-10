// src/components/Upload/JunoUploadFile.tsx

import React, { useState, useEffect } from 'react';
import { Form, Select, Checkbox, Upload, Button, message, Steps, notification } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/lib/upload/interface';
import { useTranslation } from 'react-i18next';
import { getDocumentTypes, uploadDocument } from '../../services/documentService';
import { DocumentType, Document, Field, Validation } from '../../types';
import './JunoUplaodFile.less';
import { useAuth } from '../../context/AuthContext';
import { createValidation } from '../../services/validationService';
import ValidationResultModal from '../ValidationResultModal/ValidationResultModal';

const { Dragger } = Upload;
const { Option } = Select;
const { Step } = Steps;

const JunoUploadFile: React.FC = () => {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const { user } = useAuth();

    const [currentStep, setCurrentStep] = useState<number>(0);
    const [uploading, setUploading] = useState<boolean>(false);

    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [documentType, setDocumentType] = useState<DocumentType>();
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploadedDocument, setUploadedDocument] = useState<Document | null>(null); // Para almacenar el documento subido
    const [validationResult, setValidationResult] = useState<Validation | null>(null); // Para almacenar la respuesta de la validación
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    useEffect(() => {
        fetchDocumentTypes();
    }, []);

    const fetchDocumentTypes = async () => {
        try {
            const data = await getDocumentTypes();
            setDocumentTypes(data);
            console.log('Document types:', data);
        } catch (error) {
            notification.error({
                message: 'Upps! Something went wrong',
                description: 'An error occurred while fetching the document types',
                duration: 3,
            });
        }
    };

    // Maneja el cambio en la selección del tipo de documento
    const handleDocumentTypeChange = (value: number) => {
        const selectedDocType = documentTypes.find((doc) => doc.id === value);
        if (selectedDocType) {
            setDocumentType(selectedDocType);
            form.resetFields(['validationFields']);
        } else {
            setDocumentType(undefined);
        }
    };

    // Maneja el cambio en los checkboxes de campos a validar
    const handleFieldsChange = (checkedValues: string[]) => {
        setSelectedFields(checkedValues);
    };

    // Configuración de las propiedades del componente Upload
    const uploadProps = {
        fileList,
        beforeUpload: (file: UploadFile) => {
            // Solo permitimos un archivo
            setFileList([file]);
            // Cancelamos la carga automática
            return false;
        },
        onRemove: () => {
            setFileList([]);
        },
        onChange: (info: { fileList: UploadFile[] }) => {
            setFileList(info.fileList.slice(-1)); // Limita a un archivo
        },
    };

    // Maneja el avance entre pasos
    const handleNext = async () => {
        if (currentStep === 0) {
            try {
                await form.validateFields(['documentType', 'file']);
                setUploading(true);

                // Enviar el archivo al backend
                if (fileList[0] && documentType) {
                    const file = fileList[0] as UploadFile<unknown>;
                    //const formDataFile = file.originFileObj as File; // Se va a usar para subir el documento al Blob Container

                    // Llamar a la función uploadDocument del servicio
                    const response = await uploadDocument(
                        file.name,
                        user?.id || 'undefined',
                        documentType,
                    );

                    console.log('Respuesta del backend:', response);

                    // Almacenar la información del documento subido
                    setUploadedDocument(response);
                    console.log(uploadedDocument);

                    //message.success(t('upload.successMessage', 'Archivo subido correctamente'));
                    notification.success({
                        message: 'Document has been uploaded successfully',
                        description: 'The document has been uploaded successfully',
                        duration: 3,
                    });
                    setCurrentStep(currentStep + 1);
                    setUploading(false);

                } else {
                    notification.error({
                        message: 'Upps! Something went wrong',
                        description: 'An error occurred while uploading the document',
                        duration: 3,
                    });
                    setUploading(false);
                }
            } catch (error) {
                console.log('Error al subir el archivo:', error);
                notification.error({
                    message: 'Upps! Something went wrong',
                    description: 'An error occurred while uploading the document',
                    duration: 3,
                });
                setUploading(false);
            }
        } else if (currentStep === 1) {
            try {
                const values = await form.validateFields(['validationFields']);

                console.log('Valores del formulario:', values);
                console.log('Documento subido:', uploadedDocument);

                if (uploadedDocument && user) {
                    // Preparar los datos para createValidation
                    const documentId = uploadedDocument.id;
                    const userId = user.id.toString();
                    const status = 'pending'; // Puedes ajustar el estado según sea necesario

                    // Asumimos que validation_details es un array de objetos Field
                    // Necesitamos construir el array de validation_details basado en selectedFields

                    const validationDetails: Field[] = selectedFields.map((fieldName) => ({
                        name: fieldName,
                        value: 'pending'
                        // Value sera asignado en el backend
                    }));

                    // Llamar a createValidation
                    const validationResponse = await createValidation(
                        documentId,
                        userId,
                        status,
                        validationDetails
                    );

                    setValidationResult(validationResponse);

                    setIsModalVisible(true);

                    // Aquí manejarás la creación de la validación en el backend (aún no implementado)
                    console.log('Respuesta de createValidation:', validationResponse);

                    notification.success({
                        message: 'Validation has been created successfully',
                        description: 'The validation has been created successfully',
                        duration: 3,
                    });
                    // Puedes resetear el formulario o realizar otra acción aquí

                }
            } catch (error) {
                console.log('Error al crear la validación:', error);
                notification.error({
                    message: 'Upps! Something went wrong',
                    description: 'An error occurred while creating the validation',
                    duration: 3,
                });
            }
        }
    };

    // Manejar el cierre del modal

    const handleModalClose = () => {
        setIsModalVisible(false);
        // Resetear el formulario y estados
        form.resetFields();
        setFileList([]);
        setSelectedFields([]);
        setDocumentType(undefined);
        setUploadedDocument(null);
        setCurrentStep(0);
        setUploading(false);
    };

    return (
        <>
            <Steps current={currentStep} className="upload-steps">
                <Step title={t('upload.step1Title', 'Subir Documento')} />
                <Step title={t('upload.step2Title', 'Seleccionar Campos')} />
            </Steps>

            <Form form={form} layout="vertical" className="form-upload-file">
                {currentStep === 0 && (
                    <>
                        {/* Paso 1: Selección del tipo de documento y carga del archivo */}
                        <Form.Item
                            label={t('upload.documentTypeLabel', 'Tipo de Documento')}
                            name="documentType"
                            rules={[
                                {
                                    required: true,
                                    message: t('upload.documentTypeError', 'Por favor selecciona el tipo de documento'),
                                },
                            ]}
                        >
                            <Select
                                placeholder={t('upload.documentTypePlaceholder', 'Selecciona el tipo de documento')}
                                onChange={handleDocumentTypeChange}
                            >
                                {documentTypes.map((doc) => (
                                    <Option key={doc.id} value={doc.id}>
                                        {t(`upload.documentType.${doc.name}`, doc.name)}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label={t('upload.fileLabel', 'Archivo')}
                            name="file"
                            rules={[{ required: true, message: t('upload.fileError', 'Por favor sube un archivo') }]}
                        >
                            <Dragger {...uploadProps} maxCount={1} className="upload-dragger">
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                {fileList.length === 0 ? (
                                    <p className="ant-upload-text">
                                        {t('upload.uploadPrompt', 'Haz clic o arrastra un archivo a esta área para subirlo')}
                                    </p>
                                ) : (
                                    <p className="ant-upload-text">
                                        {t('upload.selectedFile', 'Archivo seleccionado')}: <strong>{fileList[0].name}</strong>
                                    </p>
                                )}
                            </Dragger>
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" onClick={handleNext} disabled={uploading}>
                                {uploading ? t('upload.uploading', 'Subiendo...') : t('upload.uploadButton', 'Subir Documento')}
                            </Button>
                        </Form.Item>
                    </>
                )}

                {currentStep === 1 && (
                    <>
                        {/* Paso 2: Mostrar resumen y seleccionar campos a validar */}
                        <div className="step-summary">
                            <p>
                                {t('upload.summary.documentType', 'Tipo de Documento')}: <strong>{documentType?.name}</strong>
                            </p>
                            <p>
                                {t('upload.summary.fileName', 'Nombre de Archivo')}: <strong>{uploadedDocument?.name}</strong>
                            </p>
                        </div>

                        <Form.Item
                            label={t('upload.validationFieldsLabel', 'Campos a Validar')}
                            name="validationFields"
                            rules={[
                                {
                                    required: true,
                                    message: t('upload.validationFieldsError', 'Por favor selecciona al menos un campo'),
                                },
                            ]}
                        >
                            <Checkbox.Group
                                options={
                                    documentType?.fields?.map((field) => ({
                                        label: `${t(
                                            `upload.validationFields.${field.name}`,
                                            field.name.charAt(0).toUpperCase() + field.name.slice(1)
                                        )}`,
                                        value: field.name,
                                    })) || []
                                }
                                onChange={handleFieldsChange}
                                style={{ display: 'flex', flexDirection: 'column', gap: '0.3em' }}
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" onClick={handleNext}>
                                {t('upload.validateButton', 'Validar')}
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form>

            {validationResult && uploadedDocument && (
                <ValidationResultModal
                    visible={isModalVisible}
                    onClose={handleModalClose}
                    documentName={uploadedDocument.name}
                    documentType={documentType?.name || ''}
                    validationResult={validationResult.status}
                    timestamp={validationResult.timestamp}
                    fields={validationResult.validation_details}
                />
            )}
        </>
    );
};

export default JunoUploadFile;