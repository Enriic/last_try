import React, { useState } from 'react';
import { Form, Checkbox, Upload, Button, notification, Steps } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/lib/upload/interface';
import { useTranslation } from 'react-i18next';
import { uploadDocument, getDocument, getDocumentTypeById } from '../../services/documentService';
import { getResourceById } from '../../services/resourceService';
import { FieldToValidate, FieldToExtract, Validation, Resource, VehicleDetails, EmployeeDetails, DocumentType } from '../../types';
import './JunoUplaodFile.less';
import { useAuth } from '../../context/AuthContext';
import { createValidation } from '../../services/validationService';
import ValidationResultModal from '../ValidationResultModal/ValidationResultModal';
import ResourceSelect from '../common/SearchableSelect/ResourceSelect/ResourceSelect';
import DocumentSelect from '../common/SearchableSelect/DocumentSelect/DocumentSelect';
import DocumentTypeSelect from '../common/SearchableSelect/DocumentTypeSelect/DocumentTypeSelect';

const { Dragger } = Upload;
const { Step } = Steps;

const JunoUploadFile: React.FC = () => {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const { user } = useAuth();

    const [currentStep, setCurrentStep] = useState<number>(0);
    const [uploading, setUploading] = useState<boolean>(false);

    const [documentType, setDocumentType] = useState<number | string | null>(null);
    const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null);

    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

    const [resource, setResource] = useState<string | null>(null);
    const [selectedFieldsToValidate, setSelectedFieldsToValidate] = useState<string[]>([]);
    const [selectedFieldsToExtract, setSelectedFieldsToExtract] = useState<string[]>([]);

    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploadedDocument, setUploadedDocument] = useState<string | null>(null);
    const [validation, setValidationResult] = useState<Validation | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    const [useExistingDocument, setUseExistingDocument] = useState<boolean>(false);


    const handleDocumentTypeChange = async (value: number | string | null) => {
        setDocumentType(value);
        const selectedDocType = await getDocumentTypeById(value);
        setSelectedDocType(selectedDocType);
    };

    const handleResourceChange = async (value: string | null) => {
        setResource(value);
        const selectedResource = await getResourceById(value);
        setSelectedResource(selectedResource);
    };

    const handleExistingDocumentChange = async (value: string | null) => {
        const selectedDoc = value;
        if (selectedDoc) {
            setUploadedDocument(selectedDoc);

            try {
                const docDetails = await getDocument(selectedDoc);
                const docTypeDetails = await getDocumentTypeById(docDetails.document_type.toString());
                setSelectedDocType(docTypeDetails);
                setDocumentType(docDetails.document_type.toString());
                handleResourceChange(docDetails.resource);

            } catch (error) {
                notification.error({
                    message: 'Error',
                    description: 'No se pudieron obtener los detalles del documento seleccionado.',
                    duration: 3,
                });
            }
        }
    };

    const handleFieldsToValidateChange = (checkedValues: string[]) => {
        setSelectedFieldsToValidate(checkedValues);
    };

    const handleFieldsToExtractChange = (checkedValues: string[]) => {
        setSelectedFieldsToExtract(checkedValues);
    };

    const uploadProps = {
        fileList,
        beforeUpload: (file: UploadFile) => {
            setFileList([file]);
            return false;
        },
        onRemove: () => {
            setFileList([]);
        },
        onChange: (info: { fileList: UploadFile[] }) => {
            setFileList(info.fileList.slice(-1));
        },
    };

    const handleNext = async () => {
        if (currentStep === 0) {
            if (useExistingDocument) {
                try {
                    await form.validateFields(['existingDocument']);
                    setCurrentStep(currentStep + 1);
                } catch (error) {
                    console.log('Error al seleccionar el documento existente:', error);
                    notification.error({
                        message: '¡Ups! Algo salió mal',
                        description: 'Ocurrió un error al seleccionar el documento existente',
                        duration: 3,
                    });
                }
            } else {
                try {
                    await form.validateFields(['documentType', 'resource', 'file']);
                    setUploading(true);

                    if (fileList[0] && documentType && resource) {
                        const file = fileList[0] as UploadFile<unknown>;

                        const response = await uploadDocument(
                            file.name,
                            user?.id || 'undefined',
                            documentType,
                            resource,
                        );

                        console.log('Respuesta del backend:', response);

                        setUploadedDocument(response.id);

                        notification.success({
                            message: 'Documento subido exitosamente',
                            description: 'El documento ha sido subido correctamente',
                            duration: 3,
                        });
                        setCurrentStep(currentStep + 1);
                        setUploading(false);
                    } else {
                        notification.error({
                            message: '¡Ups! Algo salió mal',
                            description: 'Ocurrió un error al subir el documento',
                            duration: 3,
                        });
                        setUploading(false);
                    }
                } catch (error) {
                    console.log('Error al subir el archivo:', error);
                    notification.error({
                        message: '¡Ups! Algo salió mal',
                        description: 'Ocurrió un error al subir el documento',
                        duration: 3,
                    });
                    setUploading(false);
                }
            }
        } else if (currentStep === 1) {
            try {
                const values = await form.validateFields(['validationFields', 'extractionFields']);

                console.log('Valores del formulario:', values);
                console.log('Documento subido:', uploadedDocument);

                if (uploadedDocument && user) {
                    const userId = user.id.toString();
                    const status = 'success';
                    const validationRequest = {
                        fields_to_validate: selectedDocType?.fields_to_validate
                            .filter((field: FieldToValidate) => selectedFieldsToValidate.includes(field.id.toString()))
                            .map((field: FieldToValidate) => ({
                                id: field.id,
                                name: field.name,
                                description: field.description || '',
                                expected_value: '48276956W',
                                obtained_value: 'pending_to_obtain'
                            })),
                        fields_to_extract: selectedDocType?.fields_to_extract
                            .filter((field: FieldToExtract) => selectedFieldsToExtract.includes(field.id.toString()))
                            .map((field: FieldToExtract) => ({
                                id: field.id,
                                name: field.name,
                                description: field.description || '',
                                value: 'pending_to_extract',
                            })),
                    };

                    const validation = await createValidation(
                        uploadedDocument,
                        userId,
                        status,
                        validationRequest
                    );


                    setValidationResult(validation);
                    setIsModalVisible(true);

                    notification.success({
                        message: 'Validación creada exitosamente',
                        description: 'La validación ha sido creada correctamente',
                        duration: 3,
                    });
                }
            } catch (error) {
                console.log('Error al crear la validación:', error);
                notification.error({
                    message: '¡Ups! Algo salió mal',
                    description: 'Ocurrió un error al crear la validación',
                    duration: 3,
                });
            }
        }
    };

    const handlePrev = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        form.resetFields();
        setFileList([]);
        setResource(null);
        setSelectedFieldsToExtract([]);
        setSelectedFieldsToValidate([]);
        setDocumentType(null);
        setResource(null);
        setUploadedDocument(null);
        setCurrentStep(0);
        setUploading(false);
        setUseExistingDocument(false);
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
                        <Form.Item
                            label="Usar Documento Existente"
                            name="useExistingDocument"
                            valuePropName="checked"
                        >
                            <Checkbox onChange={(e) => setUseExistingDocument(e.target.checked)}>
                                Usar Documento Existente
                            </Checkbox>
                        </Form.Item>

                        {useExistingDocument ? (
                            <Form.Item
                                label="Documento Existente"
                                name="existingDocument"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Por favor selecciona un documento existente',
                                    },
                                ]}
                            >
                                <DocumentSelect
                                    value={uploadedDocument || null}
                                    placeholder="Selecciona un documento existente"
                                    onChange={handleExistingDocumentChange}
                                />

                            </Form.Item>
                        ) : (
                            <>
                                <Form.Item
                                    label={t('upload.documentTypeLabel', 'Tipo de Documento')}
                                    name="documentType"
                                    rules={[
                                        {
                                            required: !useExistingDocument,
                                            message: t('upload.documentTypeError', 'Por favor selecciona el tipo de documento'),
                                        },
                                    ]}
                                >
                                    <DocumentTypeSelect
                                        value={documentType?.toString()}
                                        onChange={handleDocumentTypeChange}
                                        placeholder={t('upload.documentTypePlaceholder', 'Selecciona un tipo de documento')}
                                        disabled={useExistingDocument}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Recurso"
                                    name="resource"
                                    rules={[
                                        {
                                            required: !useExistingDocument,
                                            message: 'Por favor selecciona un recurso',
                                        },
                                    ]}
                                >
                                    <ResourceSelect
                                        value={resource}
                                        onChange={handleResourceChange}
                                        placeholder="Selecciona un recurso"
                                        disabled={useExistingDocument}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={t('upload.fileLabel', 'Archivo')}
                                    name="file"
                                    rules={[
                                        { required: !useExistingDocument, message: t('upload.fileError', 'Por favor sube un archivo') },
                                    ]}
                                >
                                    <Dragger {...uploadProps} maxCount={1} className="upload-dragger" disabled={useExistingDocument}>
                                        <p className="ant-upload-drag-icon">
                                            <InboxOutlined />
                                        </p>
                                        {fileList.length === 0 ? (
                                            <p className="ant-upload-text">
                                                {t(
                                                    'upload.uploadPrompt',
                                                    'Haz clic o arrastra un archivo a esta área para subirlo'
                                                )}
                                            </p>
                                        ) : (
                                            <p className="ant-upload-text">
                                                {t('upload.selectedFile', 'Archivo seleccionado')}:{' '}
                                                <strong>{fileList[0].name}</strong>
                                            </p>
                                        )}
                                    </Dragger>
                                </Form.Item>
                            </>
                        )}

                        <Form.Item>
                            <Button
                                type="primary"
                                onClick={handleNext}
                            >
                                {useExistingDocument
                                    ? 'Continuar'
                                    : uploading
                                        ? t('upload.uploading', 'Subiendo...')
                                        : t('upload.uploadButton', 'Subir Documento')}
                            </Button>
                        </Form.Item>
                    </>
                )}


                {currentStep === 1 && (
                    <>
                        {/* Paso 2: Mostrar resumen y seleccionar campos a validar */}
                        <div className="step-summary">
                            <p>
                                {t('upload.summary.documentType', 'Tipo de Documento')}: <strong>{selectedDocType?.name}</strong>
                            </p>
                            <p>
                                Recurso: {' '}
                                <strong>
                                    {selectedResource && selectedResource.resource_type === 'vehicle'
                                        ? (selectedResource.resource_details as VehicleDetails).name : selectedResource && selectedResource.resource_type === 'employee'
                                            ? `${(selectedResource.resource_details as EmployeeDetails).first_name} ${(selectedResource.resource_details as EmployeeDetails).last_name}` : ''}
                                </strong>
                            </p>
                        </div>

                        <Form.Item
                            label={t('upload.validationFieldsLabel', 'Campos a Validar')}
                            name="validationFields"
                            rules={[
                                {
                                    required: false,
                                    message: t(
                                        'upload.validationFieldsError',
                                        'Por favor selecciona al menos un campo'
                                    ),
                                },
                            ]}
                        >
                            <Checkbox.Group
                                options={
                                    selectedDocType?.fields_to_validate?.map((field) => ({
                                        label: `${field.name.charAt(0).toUpperCase() + field.name.slice(1)}`,
                                        value: field.id.toString(),
                                    })) || []
                                }
                                onChange={handleFieldsToValidateChange}
                                value={selectedFieldsToValidate}
                                style={{ display: 'flex', flexDirection: 'column', gap: '0.3em' }}
                            />


                        </Form.Item>

                        <Form.Item
                            label={'Campos a Extraer'}
                            name="extractionFields"
                            rules={[
                                {
                                    required: false,
                                    message: t(
                                        'upload.validationFieldsError',
                                        'Por favor selecciona al menos un campo'
                                    ),
                                },
                            ]}
                        >
                            <Checkbox.Group
                                options={
                                    selectedDocType?.fields_to_extract?.map((field) => ({
                                        label: `${field.name.charAt(0).toUpperCase() + field.name.slice(1)}`,
                                        value: field.id.toString(),
                                    })) || []
                                }
                                onChange={handleFieldsToExtractChange}
                                value={selectedFieldsToExtract}
                                style={{ display: 'flex', flexDirection: 'column', gap: '0.3em' }}
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" onClick={handleNext} style={{ marginRight: '8px' }}>
                                {t('upload.validateButton', 'Validar')}
                            </Button>
                            <Button onClick={handlePrev}>
                                {t('upload.backButton', 'Paso Anterior')}
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form>

            {validation && uploadedDocument && (
                <ValidationResultModal
                    visible={isModalVisible}
                    onClose={handleModalClose}
                    documentName={validation.document_name}
                    documentType={selectedDocType?.name || ''}
                    validationResult={validation.status}
                    timestamp={validation.timestamp}
                    fields_to_validate={validation.validation_details.fields_to_validate}
                    fields_to_extract={validation.validation_details.fields_to_extract}
                />
            )}
        </>
    );
};

export default JunoUploadFile;