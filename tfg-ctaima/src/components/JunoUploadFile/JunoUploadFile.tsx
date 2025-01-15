// src/components/Upload/JunoUploadFile.tsx

import React, { useState, useEffect } from 'react';
import { Form, Select, Checkbox, Upload, Button, notification, Steps, SelectProps } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/lib/upload/interface';
import { useTranslation } from 'react-i18next';
import { getDocumentTypes, uploadDocument } from '../../services/documentService';
import { getResources } from '../../services/resourceService'; // Importamos getResources
import { DocumentType, Document, Field, Validation, Resource, VehicleDetails, EmployeeDetails } from '../../types'; // Importamos Resource
import './JunoUplaodFile.less';
import { useAuth } from '../../context/AuthContext';
import { createValidation } from '../../services/validationService';
import ValidationResultModal from '../ValidationResultModal/ValidationResultModal';

const { Dragger } = Upload;
const { Option, OptGroup } = Select;
const { Step } = Steps;

const JunoUploadFile: React.FC = () => {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const { user } = useAuth();

    const [currentStep, setCurrentStep] = useState<number>(0);
    const [uploading, setUploading] = useState<boolean>(false);

    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [documentType, setDocumentType] = useState<DocumentType | undefined>(undefined);
    const [resources, setResources] = useState<Resource[]>([]);
    const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
    const [selectedResource, setSelectedResource] = useState<Resource | undefined>(undefined);
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploadedDocument, setUploadedDocument] = useState<Document | null>(null);
    const [validationResult, setValidationResult] = useState<Validation | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);


    useEffect(() => {
        fetchDocumentTypes();
        fetchResources();
    }, []);



    const fetchResources = async () => {
        try {
            const data = await getResources();
            setResources(data);
            setFilteredResources(data); // Inicialmente, muestra todos los recursos
            console.log('Resources:', data);
        } catch (error) {
            notification.error({
                message: '¡Ups! Algo salió mal',
                description: 'Ocurrió un error al obtener los recursos',
                duration: 3,
            });
        }
    };

    const fetchDocumentTypes = async () => {
        try {
            const data = await getDocumentTypes();
            setDocumentTypes(data);
            console.log('Document types:', data);
        } catch (error) {
            notification.error({
                message: '¡Ups! Algo salió mal',
                description: 'Ocurrió un error al obtener los tipos de documento',
                duration: 3,
            });
        }
    };

    const handleSearchResource = (value: string) => {

        const lowerCaseValue = value.toLowerCase();
        const filtered = resources.filter((res) => {

            if (res.resource_type === 'vehicle') {
                const vehicle = res.resource_details as VehicleDetails;
                return (
                    vehicle.name.toLowerCase().includes(lowerCaseValue) ||
                    vehicle.registration_id.toLowerCase().includes(lowerCaseValue)
                );
            } else if (res.resource_type === 'employee') {
                const employee = res.resource_details as EmployeeDetails;
                const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
                return (
                    fullName.includes(lowerCaseValue) ||
                    employee.number_id.toLowerCase().includes(lowerCaseValue)
                );
            }

            return false;
        });

        setFilteredResources(filtered);
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

    const handleResourceChange = (value: string) => {
        const selectedRes = resources.find((res) => res.id === value);
        if (selectedRes) {
            setSelectedResource(selectedRes);
        } else {
            setSelectedResource(undefined);
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
                await form.validateFields(['documentType', 'resource', 'file']);
                setUploading(true);

                // Enviar el archivo al backend
                if (fileList[0] && documentType && selectedResource) {
                    const file = fileList[0] as UploadFile<unknown>;

                    // Llamar a la función uploadDocument del servicio
                    const response = await uploadDocument(
                        file.name,
                        user?.id || 'undefined',
                        documentType,
                        selectedResource,
                    );

                    console.log('Respuesta del backend:', response);

                    // Almacenar la información del documento subido
                    setUploadedDocument(response);

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
        } else if (currentStep === 1) {
            try {
                const values = await form.validateFields(['validationFields']);

                console.log('Valores del formulario:', values);
                console.log('Documento subido:', uploadedDocument);

                if (uploadedDocument && user) {
                    // Preparar los datos para createValidation
                    const documentId = uploadedDocument.id;
                    const userId = user.id.toString();
                    const status = 'pending';

                    const validationDetails: Field[] = selectedFields.map((fieldName) => ({
                        name: fieldName,
                        value: 'pending',
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

                    console.log('Respuesta de createValidation:', validationResponse);

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

    // Manejar el cierre del modal
    const handleModalClose = () => {
        setIsModalVisible(false);
        // Resetear el formulario y estados
        form.resetFields();
        setFileList([]);
        setSelectedFields([]);
        setDocumentType(undefined);
        setSelectedResource(undefined);
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
                        {/* Paso 1: Selección del tipo de documento y recurso, y carga del archivo */}
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
                                        {doc.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Recurso"
                            name="resource"
                            rules={[
                                {
                                    required: true,
                                    message: 'Por favor selecciona un recurso',
                                },
                            ]}
                        >
                            <Select
                                placeholder="Selecciona un recurso"
                                onChange={handleResourceChange}
                                showSearch
                                filterOption={false}
                                onSearch={handleSearchResource}
                                notFoundContent={null}
                            >
                                {[
                                    { type: 'vehicle', label: 'Vehículos', resources: filteredResources.filter(res => res.resource_type === 'vehicle') },
                                    { type: 'employee', label: 'Empleados', resources: filteredResources.filter(res => res.resource_type === 'employee') },
                                ].map(group => (
                                    group.resources.length > 0 && (
                                        <OptGroup key={group.type} label={group.label}>
                                            {group.resources.map(res => (
                                                <Option key={res.id} value={res.id}>
                                                    {res.resource_type === 'vehicle' ?
                                                        `${(res.resource_details as VehicleDetails).name} - ${(res.resource_details as VehicleDetails).registration_id}` :
                                                        `${(res.resource_details as EmployeeDetails).first_name} ${(res.resource_details as EmployeeDetails).last_name} - ${(res.resource_details as EmployeeDetails).number_id}`}
                                                </Option>
                                            ))}
                                        </OptGroup>
                                    )
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label={t('upload.fileLabel', 'Archivo')}
                            name="file"
                            rules={[
                                { required: true, message: t('upload.fileError', 'Por favor sube un archivo') },
                            ]}
                        >
                            <Dragger {...uploadProps} maxCount={1} className="upload-dragger">
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

                        <Form.Item>
                            <Button type="primary" onClick={handleNext} disabled={uploading}>
                                {uploading
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
                                {t('upload.summary.documentType', 'Tipo de Documento')}: <strong>{documentType?.name}</strong>
                            </p>
                            <p>
                                Recurso:{' '}
                                <strong>
                                    {selectedResource && selectedResource.resource_type === 'vehicle'
                                        ? (selectedResource.resource_details as VehicleDetails).name
                                        : selectedResource && selectedResource.resource_type === 'employee'
                                            ? `${(selectedResource.resource_details as EmployeeDetails).first_name} ${(selectedResource.resource_details as EmployeeDetails).last_name}`
                                            : ''}
                                </strong>
                            </p>
                        </div>

                        <Form.Item
                            label={t('upload.validationFieldsLabel', 'Campos a Validar')}
                            name="validationFields"
                            rules={[
                                {
                                    required: true,
                                    message: t(
                                        'upload.validationFieldsError',
                                        'Por favor selecciona al menos un campo'
                                    ),
                                },
                            ]}
                        >
                            <Checkbox.Group
                                options={
                                    documentType?.fields?.map((field) => ({
                                        label: `${field.name.charAt(0).toUpperCase() + field.name.slice(1)}`,
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