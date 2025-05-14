import React from 'react';
import { Form, Steps } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import DuplicateDocumentModal from '../Modals/DuplicateDocumentModal/DuplicateDocumentModal';
import ValidationDetailsModal from '../Modals/ValidationDetailsModal/ValidationDetailsModal';
import StepOne from './Steps/StepOne';
import StepTwo from './Steps/StepTwo';
import { useJunoUploadFile } from './hooks/useJunoUploadFile';
import './JunoUplaodFile.less';

const { Step } = Steps;

{/* Interfaz que define las propiedades necesarias para el componente */ }
interface JunoUploadFileProps {
    documentId: string;
    setDocumentId: React.Dispatch<React.SetStateAction<string>>;
}

{/* 
 * Componente principal para la carga y validación de documentos
 * Implementa un proceso de dos pasos para la carga y validación de documentos
 */}
const JunoUploadFile: React.FC<JunoUploadFileProps> = ({ documentId, setDocumentId }) => {
    {/* Inicialización de hooks y formulario */ }
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const { user } = useAuth();

    {/* 
     * Obtención de estados y métodos del hook personalizado
     * Gestiona toda la lógica de negocio del componente
     */}
    const {
        // Estados para el flujo de trabajo
        currentStep,            // Paso actual del asistente
        uploading,             // Indica si hay una carga en progreso
        documentType,          // Tipo de documento seleccionado
        selectedDocType,       // Detalles del tipo de documento
        selectedResource,      // Recurso seleccionado (vehículo/empleado)
        selectedFieldsToValidate, // Campos seleccionados para validación
        selectedFieldsToExtract,  // Campos seleccionados para extracción
        fileList,              // Lista de archivos para cargar
        uploadedDocument,      // Documento ya cargado
        validation,            // Resultado de la validación
        isModalVisible,        // Control de visibilidad del modal de validación
        useExistingDocument,   // Indica si se usa un documento existente
        associatedEntities,    // Entidades asociadas al tipo de documento
        existingDocumentData,  // Datos del documento existente
        isDuplicateModalVisible, // Control de visibilidad del modal de duplicados

        // Métodos para gestionar el estado
        setFileList,           // Actualiza la lista de archivos
        setUseExistingDocument, // Cambia el modo de documento existente
        setIsDuplicateModalVisible, // Controla visibilidad modal duplicados
        handleDocumentTypeChange,    // Gestiona cambio de tipo documento
        handleResourceChange,        // Gestiona cambio de recurso
        handleCompanyChange,         // Gestiona cambio de empresa
        handleExistingDocumentChange, // Gestiona selección doc existente
        handleFieldsToValidateChange, // Gestiona campos de validación
        handleFieldsToExtractChange,  // Gestiona campos de extracción
        handleNext,                   // Avanza al siguiente paso
        handlePrev,                   // Retrocede al paso anterior
        handleModalClose,             // Cierra modales
        uploadProps,                  // Props para componente de carga
    } = useJunoUploadFile({
        user,
        setDocumentId,
        form,
    });

    return (
        <>
            {/* Indicador de progreso del asistente */}
            <Steps current={currentStep} className="upload-steps">
                <Step title={t('upload.step1Title')} />
                <Step title={t('upload.step2Title')} />
            </Steps>

            {/* Formulario principal con renderizado condicional según el paso actual */}
            <Form form={form} layout="vertical" className="form-upload-file">
                {/* Paso 1: Selección/carga de documento */}
                {currentStep === 0 && (
                    <StepOne
                        form={form}
                        t={t}
                        uploading={uploading}
                        useExistingDocument={useExistingDocument}
                        uploadedDocument={uploadedDocument}
                        fileList={fileList}
                        documentType={documentType}
                        associatedEntities={associatedEntities}
                        companyId={null}
                        resource={null}
                        handleDocumentTypeChange={handleDocumentTypeChange}
                        handleResourceChange={handleResourceChange}
                        handleCompanyChange={handleCompanyChange}
                        handleExistingDocumentChange={handleExistingDocumentChange}
                        handleNext={handleNext}
                        uploadProps={uploadProps}
                        setUseExistingDocument={setUseExistingDocument}
                        setFileList={setFileList}
                    />
                )}

                {/* Paso 2: Configuración de campos a validar/extraer */}
                {currentStep === 1 && (
                    <StepTwo
                        t={t}
                        selectedDocType={selectedDocType}
                        selectedResource={selectedResource}
                        selectedFieldsToValidate={selectedFieldsToValidate}
                        selectedFieldsToExtract={selectedFieldsToExtract}
                        handleFieldsToValidateChange={handleFieldsToValidateChange}
                        handleFieldsToExtractChange={handleFieldsToExtractChange}
                        handleNext={handleNext}
                        handlePrev={handlePrev}
                    />
                )}
            </Form>

            {/* Modal para mostrar detalles de la validación */}
            {validation && uploadedDocument && (
                <ValidationDetailsModal
                    visible={isModalVisible}
                    validation={validation}
                    onClose={handleModalClose}
                />
            )}

            {/* Modal para manejar documentos duplicados */}
            {existingDocumentData && (
                <DuplicateDocumentModal
                    visible={isDuplicateModalVisible}
                    documentData={existingDocumentData}
                    onClose={() => setIsDuplicateModalVisible(false)}
                    useExistingDocument={() => {
                        setIsDuplicateModalVisible(false);
                        handleExistingDocumentChange(existingDocumentData.id);
                    }}
                />
            )}
        </>
    );
};

export default JunoUploadFile;