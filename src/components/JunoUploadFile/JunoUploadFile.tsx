import React, { useState } from 'react';
import { Form, Checkbox, Upload, Button, notification, Steps } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/lib/upload/interface';
import { useTranslation } from 'react-i18next';
import { uploadDocument, getDocument, getDocumentTypeById } from '../../services/documentService';
import { getResourceById } from '../../services/resourceService';
import { FieldToValidate, FieldToExtract, Validation, Resource, VehicleDetails, EmployeeDetails, DocumentType, Company, Document } from '../../types';
import './JunoUplaodFile.less';
import { useAuth } from '../../context/AuthContext';
import { createValidation } from '../../services/validationService';
import { getCompanyById } from '../../services/companyService';
import ResourceSelect from '../common/SearchableSelect/ResourceSelect/ResourceSelect';
import DocumentSelect from '../common/SearchableSelect/DocumentSelect/DocumentSelect';
import DocumentTypeSelect from '../common/SearchableSelect/DocumentTypeSelect/DocumentTypeSelect';
import CompanySelect from '../common/SearchableSelect/CompanySelect/CompanySelect';
import DuplicateDocumentModal from '../DuplicateDocumentModal/DuplicateDocumentModal';
import ValidationDetailsModal from '../ValidationDetailsModal/ValidationDetailsModal';
import DynamicInputs from './DynamicForm/DynamicForm';


const { Dragger } = Upload;
const { Step } = Steps;

interface JunoUploadFileProps {
    documentId: string;
    setDocumentId: React.Dispatch<React.SetStateAction<string>>;
}

const JunoUploadFile: React.FC<JunoUploadFileProps> = ({ documentId, setDocumentId }) => {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const { user } = useAuth();

    const [currentStep, setCurrentStep] = useState<number>(0);
    const [uploading, setUploading] = useState<boolean>(false);

    const [documentType, setDocumentType] = useState<number | string | null>(null);
    const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null);

    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

    const [resource, setResource] = useState<string | null>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [selectedFieldsToValidate, setSelectedFieldsToValidate] = useState<string[]>([]);
    const [selectedFieldsToExtract, setSelectedFieldsToExtract] = useState<string[]>([]);

    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploadedDocument, setUploadedDocument] = useState<string | null>(null);
    const [validation, setValidationResult] = useState<Validation | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    const [useExistingDocument, setUseExistingDocument] = useState<boolean>(false);

    const [associatedEntity, setAssociatedEntity] = useState<string>('resource'); // Valor por defecto 'resource'
    const [associatedEntities, setAssociatedEntities] = useState<string[]>([]);


    const [existingDocumentData, setExistingDocumentData] = useState<Document | null>(null);
    const [isDuplicateModalVisible, setIsDuplicateModalVisible] = useState<boolean>(false);

    const handleDocumentTypeChange = async (value: number | string | null) => {
        setDocumentType(value);
        if (!value) {
            setSelectedDocType(null);
            return;
        }
        const selectedDocType = await getDocumentTypeById(value);
        setSelectedDocType(selectedDocType);
        setAssociatedEntities(selectedDocType.associated_entities); // Almacenar los tipos de entidad asociados
        console.log(selectedDocType)
    };


    const handleResourceChange = async (value: string | null) => {
        setResource(value);
        if (value) {
            try {
                const selectedResource = await getResourceById(value);
                setSelectedResource(selectedResource);
            } catch (error) {
                console.error('Error fetching resource:', error);
                notification.error({
                    message: 'Error',
                    description: 'No se pudo obtener el recurso seleccionado.',
                    duration: 3,
                });
            }
        } else {
            setSelectedResource(null);
        }
    };

    const handleCompanyChange = async (value: string | null) => {
        setCompanyId(value);
        if (value) {
            try {
                const selectedCompany = await getCompanyById(value);
                setSelectedCompany(selectedCompany);
            } catch (error) {
                console.error('Error fetching company:', error);
                notification.error({
                    message: 'Error',
                    description: 'No se pudo obtener la empresa seleccionada.',
                    duration: 3,
                });
            }
        } else {
            setSelectedCompany(null);
        }
    }

    const handleExistingDocumentChange = async (value: string | null) => {
        const selectedDoc = value;
        if (selectedDoc) {
            form.setFieldsValue({
                existingDocument: value,
                useExistingDocument: true,
            });
            setUseExistingDocument(true);
            setUploadedDocument(selectedDoc);
            setDocumentId(selectedDoc);
            console.log('Documento seleccionado:', documentId);

            try {
                const docDetails = await getDocument(selectedDoc);
                const docTypeDetails = await getDocumentTypeById(docDetails.document_type.toString());
                setSelectedDocType(docTypeDetails);
                handleDocumentTypeChange(docDetails.document_type);
                handleResourceChange(docDetails.resource);
                handleCompanyChange(docDetails.company);
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

                    if (fileList[0] && documentType && (resource || companyId)) {
                        const file = fileList[0] as UploadFile<unknown>;

                        //const entityId = associatedEntity === 'company' ? companyId : resource;

                        try {
                            const response = await uploadDocument(
                                file.originFileObj as File,
                                user?.id || 'undefined',
                                documentType,
                                resource,
                                companyId,
                                associatedEntities
                            );

                            if (response.status === 409) {
                                // El documento ya existe
                                notification.warning({
                                    message: 'Documento duplicado',
                                    description: 'El documento que intentas subir ya existe.',
                                    duration: 3,
                                });

                                // Guardamos los datos del documento existente y mostramos el modal
                                setExistingDocumentData(response.data.document);
                                setIsDuplicateModalVisible(true);
                                setUploading(false);
                            } else {
                                // Documento subido exitosamente
                                console.log('Respuesta del backend:', response.data);

                                setUploadedDocument(response.data.id);
                                setDocumentId(response.data.id);

                                notification.success({
                                    message: 'Documento subido exitosamente',
                                    description: 'El documento ha sido subido correctamente',
                                    duration: 3,
                                });
                                setCurrentStep(currentStep + 1);
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
                    console.log('User ID:', userId);
                    const status = 'pending';

                    // Type Guards para determinar el tipo de detalles
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    function isVehicleDetails(details: any): details is VehicleDetails {
                        return 'registration_id' in details;
                    }

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    function isEmployeeDetails(details: any): details is EmployeeDetails {
                        return 'worker_id' in details;
                    }

                    const validationRequest = {
                        fields_to_validate: selectedDocType?.fields_to_validate
                            .filter((field: FieldToValidate) => selectedFieldsToValidate.includes(field.id.toString()))
                            .map((field: FieldToValidate) => {
                                let expectedValue = '';
                                console.log('Associated Entity:', associatedEntities)
                                if (associatedEntities.includes('company')) {
                                    console.log('Estamos dentro del if de associatedEntity = Company')
                                    console.log('SelectedCompany:', selectedCompany)
                                    if (selectedCompany && field.name in selectedCompany) {
                                        console.log('Field name', field.name)
                                        console.log('Selected Company', selectedCompany)
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        expectedValue = (selectedCompany as any)[field.name]?.toString() || '';
                                    }
                                }
                                if (associatedEntities.includes('resource') && selectedResource?.resource_details) {
                                    console.log('Selectedresource:', selectedResource)
                                    const details = selectedResource.resource_details;
                                    console.log('Resource Details:', details);

                                    if (isVehicleDetails(details) && selectedResource.resource_type === 'vehicle') {
                                        if (field.name in details) {
                                            expectedValue = (details as VehicleDetails)[field.name as keyof VehicleDetails]?.toString() || '';
                                        }
                                    } else if (isEmployeeDetails(details) && selectedResource.resource_type === 'employee') {
                                        if (field.name in details) {
                                            expectedValue = (details as EmployeeDetails)[field.name as keyof EmployeeDetails]?.toString() || '';
                                        }
                                    }
                                }

                                return {
                                    id: field.id,
                                    name: field.name,
                                    description: field.description || '',
                                    expected_value: expectedValue,
                                    obtained_value: 'pending_to_obtain',
                                };
                            }),

                        fields_to_extract: selectedDocType?.fields_to_extract
                            .filter((field: FieldToExtract) => selectedFieldsToExtract.includes(field.id.toString()))
                            .map((field: FieldToExtract) => ({
                                id: field.id,
                                name: field.name,
                                description: field.description || '',
                                obtained_value: 'pending_to_extract',
                            })),
                    };

                    console.log('Solicitud de validación:', validationRequest);

                    const validation = await createValidation(
                        uploadedDocument,
                        userId,
                        status,
                        validationRequest
                    );

                    console.log('Validación creada:', validation);


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
        setDocumentId('');
        setCurrentStep(0);
        setUploading(false);
        setUseExistingDocument(false);
    };

    return (
        < >
            <Steps current={currentStep} className="upload-steps">
                <Step title={t('upload.step1Title')} />
                <Step title={t('upload.step2Title')} />
            </Steps>

            <Form form={form} layout="vertical" className="form-upload-file">
                {currentStep === 0 && (
                    <>
                        <Form.Item
                            label={t('upload.useExistingDocumentLabel')}
                            name="useExistingDocument"
                            valuePropName="checked"
                        >
                            <Checkbox onChange={(e) => setUseExistingDocument(e.target.checked)}>
                                {t('upload.useExistingDocument')}
                            </Checkbox>
                        </Form.Item>

                        {useExistingDocument ? (
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
                            <>
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

                                <DynamicInputs
                                    associatedEntities={associatedEntities}
                                    useExistingDocument={useExistingDocument}
                                    companyId={companyId}
                                    resource={resource}
                                    handleCompanyChange={handleCompanyChange}
                                    handleResourceChange={handleResourceChange}
                                />

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
                                        maxCount={1}
                                        className="upload-dragger"
                                        disabled={useExistingDocument}
                                    >
                                        <p className="ant-upload-drag-icon">
                                            <InboxOutlined />
                                        </p>
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

                        <Form.Item>
                            <Button type="primary" onClick={handleNext}>
                                {useExistingDocument
                                    ? t('upload.continueButton')
                                    : uploading
                                        ? t('upload.uploading')
                                        : t('upload.uploadButton')}
                            </Button>
                        </Form.Item>
                    </>
                )}

                {currentStep === 1 && (
                    <>
                        {/* Paso 2: Mostrar resumen y seleccionar campos a validar */}
                        <div className="step-summary">
                            <p>
                                {t('upload.summary.documentType')}: <strong>{selectedDocType?.name}</strong>
                            </p>
                            <p>
                                {t('upload.summary.resource')}:{' '}
                                <strong>
                                    {selectedResource && selectedResource.resource_type === 'vehicle'
                                        ? (selectedResource.resource_details as VehicleDetails).name
                                        : selectedResource &&
                                            selectedResource.resource_type === 'employee'
                                            ? `${(selectedResource.resource_details as EmployeeDetails).first_name
                                            } ${(selectedResource.resource_details as EmployeeDetails).last_name
                                            }`
                                            : ''}
                                </strong>
                            </p>
                        </div>

                        <Form.Item
                            label={t('upload.validationFieldsLabel')}
                            name="validationFields"
                            // Si es obligatorio
                            rules={[
                                {
                                    required: true,
                                    message: t('upload.validationFieldsError'),
                                },
                            ]}
                        >
                            <Checkbox.Group
                                options={
                                    selectedDocType?.fields_to_validate?.map((field) => ({
                                        label: `${field.name.charAt(0).toUpperCase() + field.name.slice(1)
                                            }`,
                                        value: field.id.toString(),
                                    })) || []
                                }
                                onChange={handleFieldsToValidateChange}
                                value={selectedFieldsToValidate}
                                style={{ display: 'flex', flexDirection: 'column', gap: '0.3em' }}
                            />
                        </Form.Item>

                        <Form.Item
                            label={t('upload.extractionFieldsLabel')}
                            name="extractionFields"
                        // Si es obligatorio
                        // rules={[
                        //   {
                        //     required: true,
                        //     message: t('upload.extractionFieldsError'),
                        //   },
                        // ]}
                        >
                            <Checkbox.Group
                                options={
                                    selectedDocType?.fields_to_extract?.map((field) => ({
                                        label: `${field.name.charAt(0).toUpperCase() + field.name.slice(1)
                                            }`,
                                        value: field.id.toString(),
                                    })) || []
                                }
                                onChange={handleFieldsToExtractChange}
                                value={selectedFieldsToExtract}
                                style={{ display: 'flex', flexDirection: 'column', gap: '0.3em' }}
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                onClick={handleNext}
                                style={{ marginRight: '8px' }}
                            >
                                {t('upload.validateButton')}
                            </Button>
                            <Button onClick={handlePrev}>{t('upload.backButton')}</Button>
                        </Form.Item>
                    </>
                )}
            </Form>

            {validation && uploadedDocument && (
                <ValidationDetailsModal
                    visible={isModalVisible}
                    validation={validation}
                    onClose={handleModalClose}
                />
            )}

            {existingDocumentData && (
                <DuplicateDocumentModal
                    visible={isDuplicateModalVisible}
                    documentData={existingDocumentData}
                    onClose={() => setIsDuplicateModalVisible(false)}
                    useExistingDocument={() => {
                        setIsDuplicateModalVisible(false);
                        handleExistingDocumentChange(existingDocumentData.id)
                    }}
                />
            )}
        </>
    );
};

export default JunoUploadFile;