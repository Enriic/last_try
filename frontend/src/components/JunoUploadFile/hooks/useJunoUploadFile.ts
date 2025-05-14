import { useState } from 'react';
import { Form, UploadFile, notification } from 'antd';
import {
    uploadDocument,
    getDocument,
    getDocumentTypeById,
} from '../../../services/documentService';
import { createValidation } from '../../../services/validationService';
import { getResourceById } from '../../../services/resourceService';
import { getCompanyById } from '../../../services/companyService';
import {
    FieldToValidate,
    FieldToExtract,
    Validation,
    Resource,
    VehicleDetails,
    EmployeeDetails,
    DocumentType,
    Company,
    Document,
} from '../../../types';

/**
 * Interfaz de propiedades para el hook useJunoUploadFile
 */
interface UseJunoUploadFileProps {
    user: any; // Usuario autenticado actual
    setDocumentId: React.Dispatch<React.SetStateAction<string>>; // Función para establecer el ID del documento
    form: any; // Instancia del formulario de Ant Design
}

/**
 * Hook personalizado que gestiona el flujo de trabajo de carga de documentos
 * Maneja el estado del formulario, interacciones con API y proceso de validación
 */
export const useJunoUploadFile = ({
    user,
    setDocumentId,
    form,
}: UseJunoUploadFileProps) => {
    // ---------- GESTIÓN DE ESTADO ----------

    // Navegación del asistente
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [uploading, setUploading] = useState<boolean>(false);

    // Información del tipo de documento
    const [documentType, setDocumentType] = useState<number | string | null>(null);
    const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null);

    // Entidades asociadas
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [resource, setResource] = useState<string | null>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);

    // Campos para validación y extracción
    const [selectedFieldsToValidate, setSelectedFieldsToValidate] = useState<string[]>([]);
    const [selectedFieldsToExtract, setSelectedFieldsToExtract] = useState<string[]>([]);

    // Estado de carga de archivos
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploadedDocument, setUploadedDocument] = useState<string | null>(null);

    // Resultados de validación
    const [validation, setValidationResult] = useState<Validation | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    // Modo de selección de documento
    const [useExistingDocument, setUseExistingDocument] = useState<boolean>(false);
    const [associatedEntities, setAssociatedEntities] = useState<string[]>([]);

    // Gestión de documentos duplicados
    const [existingDocumentData, setExistingDocumentData] = useState<Document | null>(null);
    const [isDuplicateModalVisible, setIsDuplicateModalVisible] = useState<boolean>(false);

    // ---------- MANEJADORES DE EVENTOS ----------

    /**
     * Gestiona el cambio en la selección del tipo de documento
     * Obtiene los detalles del tipo de documento y actualiza las entidades asociadas
     */
    const handleDocumentTypeChange = async (value: number | string | null) => {
        setDocumentType(value);
        if (!value) {
            setSelectedDocType(null);
            return;
        }
        const docType = await getDocumentTypeById(value);
        setSelectedDocType(docType);
        setAssociatedEntities(docType.associated_entities);
    };

    /**
     * Gestiona el cambio en la selección del recurso
     * Obtiene los detalles del recurso desde la API
     */
    const handleResourceChange = async (value: string | null) => {
        setResource(value);
        if (value) {
            try {
                const resourceData = await getResourceById(value);
                setSelectedResource(resourceData);
            } catch (error) {
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

    /**
     * Gestiona el cambio en la selección de la empresa
     * Obtiene los detalles de la empresa desde la API
     */
    const handleCompanyChange = async (value: string | null) => {
        setCompanyId(value);
        if (value) {
            try {
                const companyData = await getCompanyById(value);
                setSelectedCompany(companyData);
            } catch (error) {
                notification.error({
                    message: 'Error',
                    description: 'No se pudo obtener la empresa seleccionada.',
                    duration: 3,
                });
            }
        } else {
            setSelectedCompany(null);
        }
    };

    /**
     * Gestiona la selección de un documento existente
     * Carga los detalles del documento y rellena el formulario con los datos asociados
     */
    const handleExistingDocumentChange = async (value: string | null) => {
        if (value) {
            // Actualiza los valores del formulario
            form.setFieldsValue({
                existingDocument: value,
                useExistingDocument: true,
            });
            setUseExistingDocument(true);
            setUploadedDocument(value);
            setDocumentId(value);

            try {
                // Obtiene detalles del documento y rellena los campos del formulario
                const docDetails = await getDocument(value);
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

    /**
     * Actualiza los campos seleccionados para validación cuando cambian los checkboxes
     */
    const handleFieldsToValidateChange = (checkedValues: string[]) => {
        setSelectedFieldsToValidate(checkedValues);
    };

    /**
     * Actualiza los campos seleccionados para extracción cuando cambian los checkboxes
     */
    const handleFieldsToExtractChange = (checkedValues: string[]) => {
        setSelectedFieldsToExtract(checkedValues);
    };

    /**
     * Configuración para el componente Upload de Ant Design
     */
    const uploadProps = {
        fileList,
        beforeUpload: (file: UploadFile) => {
            setFileList([file]);
            return false; // Previene la carga automática
        },
        onRemove: () => {
            setFileList([]);
        },
        onChange: (info: { fileList: UploadFile[] }) => {
            setFileList(info.fileList.slice(-1)); // Mantiene solo un archivo
        },
    };

    /**
     * Maneja el clic en el botón siguiente según el paso actual
     * Paso 0: Sube el documento o valida la selección de documento existente
     * Paso 1: Crea la solicitud de validación con los campos seleccionados
     */
    const handleNext = async () => {
        if (currentStep === 0) {
            if (useExistingDocument) {
                // Cuando se usa un documento existente
                try {
                    await form.validateFields(['existingDocument']);
                    setCurrentStep(currentStep + 1);
                } catch (error) {
                    notification.error({
                        message: '¡Ups! Algo salió mal',
                        description: 'Ocurrió un error al seleccionar el documento existente',
                        duration: 3,
                    });
                }
            } else {
                // Cuando se sube un nuevo documento
                try {
                    // Valida los campos requeridos
                    await form.validateFields(['documentType', 'resource', 'file']);
                    setUploading(true);

                    if (fileList[0] && documentType && (resource || companyId)) {
                        const file = fileList[0];
                        try {
                            // Sube el documento al servidor
                            const response = await uploadDocument(
                                file.originFileObj as File,
                                user?.id || 'undefined',
                                documentType,
                                resource,
                                companyId,
                                associatedEntities
                            );

                            if (response.status === 409) {
                                // Manejo de caso de documento duplicado
                                notification.warning({
                                    message: 'Documento duplicado',
                                    description: 'El documento que intentas subir ya existe.',
                                    duration: 3,
                                });
                                setExistingDocumentData(response.data.document);
                                setIsDuplicateModalVisible(true);
                                setUploading(false);
                            } else {
                                // Documento subido correctamente
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
                        } catch (err) {
                            // Manejo de error de carga
                            notification.error({
                                message: '¡Ups! Algo salió mal',
                                description: 'Ocurrió un error al subir el documento',
                                duration: 3,
                            });
                            setUploading(false);
                        }
                    } else {
                        // Faltan datos requeridos
                        notification.error({
                            message: '¡Ups! Algo salió mal',
                            description: 'Ocurrió un error al subir el documento',
                            duration: 3,
                        });
                        setUploading(false);
                    }
                } catch (err) {
                    // Error de validación del formulario
                    notification.error({
                        message: '¡Ups! Algo salió mal',
                        description: 'Ocurrió un error al subir el documento',
                        duration: 3,
                    });
                    setUploading(false);
                }
            }
        } else if (currentStep === 1) {
            // Procesamiento del paso de validación
            try {
                await form.validateFields(['validationFields', 'extractionFields']);
                if (uploadedDocument && user) {
                    const userId = user.id.toString();
                    const status = 'pending';

                    // Guardias de tipo para manejar los detalles del recurso de forma segura
                    function isVehicleDetails(details: any): details is VehicleDetails {
                        return 'registration_id' in details;
                    }
                    function isEmployeeDetails(details: any): details is EmployeeDetails {
                        return 'worker_id' in details;
                    }

                    // Construir objeto de solicitud de validación
                    const validationRequest = {
                        // Mapea los campos de validación seleccionados con valores esperados
                        fields_to_validate: selectedDocType?.fields_to_validate
                            .filter((field: FieldToValidate) =>
                                selectedFieldsToValidate.includes(field.id.toString())
                            )
                            .map((field: FieldToValidate) => {
                                let expectedValue = '';

                                // Intenta obtener el valor esperado de la empresa si está asociada
                                if (associatedEntities.includes('company')) {
                                    if (selectedCompany && field.name in selectedCompany) {
                                        expectedValue =
                                            (selectedCompany as any)[field.name]?.toString() || '';
                                    }
                                }

                                // Intenta obtener el valor esperado del recurso si está asociado
                                if (
                                    associatedEntities.includes('resource') &&
                                    selectedResource?.resource_details
                                ) {
                                    const details = selectedResource.resource_details;
                                    // Maneja campos específicos de vehículos
                                    if (
                                        isVehicleDetails(details) &&
                                        selectedResource.resource_type === 'vehicle'
                                    ) {
                                        if (field.name in details) {
                                            expectedValue =
                                                (details as VehicleDetails)[
                                                    field.name as keyof VehicleDetails
                                                ]?.toString() || '';
                                        }
                                    }
                                    // Maneja campos específicos de empleados
                                    else if (
                                        isEmployeeDetails(details) &&
                                        selectedResource.resource_type === 'employee'
                                    ) {
                                        if (field.name in details) {
                                            expectedValue =
                                                (details as EmployeeDetails)[
                                                    field.name as keyof EmployeeDetails
                                                ]?.toString() || '';
                                        }
                                    }
                                }

                                // Devuelve objeto de campo formateado
                                return {
                                    id: field.id,
                                    name: field.name,
                                    description: field.description || '',
                                    expected_value: expectedValue,
                                    obtained_value: 'pending_to_obtain',
                                };
                            }),

                        // Mapea los campos de extracción seleccionados
                        fields_to_extract: selectedDocType?.fields_to_extract
                            .filter((field: FieldToExtract) =>
                                selectedFieldsToExtract.includes(field.id.toString())
                            )
                            .map((field: FieldToExtract) => ({
                                id: field.id,
                                name: field.name,
                                description: field.description || '',
                                obtained_value: 'pending_to_extract',
                            })),
                    };

                    // Crea la solicitud de validación en el servidor
                    const newValidation = await createValidation(
                        uploadedDocument,
                        userId,
                        status,
                        validationRequest
                    );

                    // Muestra los resultados de validación
                    setValidationResult(newValidation);
                    setIsModalVisible(true);
                    notification.success({
                        message: 'Validación creada exitosamente',
                        description: 'La validación ha sido creada correctamente',
                        duration: 3,
                    });
                }
            } catch (err) {
                // Manejo de error en la creación de validación
                notification.error({
                    message: '¡Ups! Algo salió mal',
                    description: 'Ocurrió un error al crear la validación',
                    duration: 3,
                });
            }
        }
    };

    /**
     * Maneja la navegación al paso anterior
     */
    const handlePrev = () => {
        setCurrentStep(currentStep - 1);
    };

    /**
     * Maneja el cierre del modal y reinicia el estado del formulario
     */
    const handleModalClose = () => {
        setIsModalVisible(false);
        // Reinicia todo el estado del formulario
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

    // Devuelve todos los estados y manejadores necesarios para el componente
    return {
        // Estados
        currentStep,
        uploading,
        documentType,
        selectedDocType,
        selectedResource,
        selectedCompany,
        resource,
        companyId,
        selectedFieldsToValidate,
        selectedFieldsToExtract,
        fileList,
        uploadedDocument,
        validation,
        isModalVisible,
        useExistingDocument,
        associatedEntities,
        existingDocumentData,
        isDuplicateModalVisible,

        // Métodos
        setFileList,
        setUseExistingDocument,
        setIsDuplicateModalVisible,
        handleDocumentTypeChange,
        handleResourceChange,
        handleCompanyChange,
        handleExistingDocumentChange,
        handleFieldsToValidateChange,
        handleFieldsToExtractChange,
        handleNext,
        handlePrev,
        handleModalClose,
        uploadProps,
    };
};