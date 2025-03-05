import React from 'react';
import { Form, Checkbox, Button } from 'antd';
import { FieldToValidate, FieldToExtract, DocumentType, Resource, VehicleDetails, EmployeeDetails } from '../../../types';

interface StepTwoProps {
    /* Función de traducción i18n */
    t: any;
    /* Tipo de documento seleccionado con sus campos asociados */
    selectedDocType: DocumentType | null;
    /* Recurso seleccionado (vehículo o empleado) */
    selectedResource: Resource | null;
    /* Array de IDs de campos seleccionados para validación */
    selectedFieldsToValidate: string[];
    /* Array de IDs de campos seleccionados para extracción */
    selectedFieldsToExtract: string[];
    /* Manejador para actualizar los campos de validación seleccionados */
    handleFieldsToValidateChange: (checkedValues: string[]) => void;
    /* Manejador para actualizar los campos de extracción seleccionados */
    handleFieldsToExtractChange: (checkedValues: string[]) => void;
    handleNext: () => void;
    handlePrev: () => void;
}

/**
 * Componente que representa el segundo paso del asistente de carga de documentos
 * Muestra un resumen de la selección y permite elegir campos para validación y extracción
 */
const StepTwo: React.FC<StepTwoProps> = ({
    t,
    selectedDocType,
    selectedResource,
    selectedFieldsToValidate,
    selectedFieldsToExtract,
    handleFieldsToValidateChange,
    handleFieldsToExtractChange,
    handleNext,
    handlePrev,
}) => {
    return (
        <>
            {/* Resumen de la selección actual */}
            <div className="step-summary">
                <p>
                    {t('upload.summary.documentType')}: <strong>{selectedDocType?.name}</strong>
                </p>
                <p>
                    {t('upload.summary.resource')}:{' '}
                    <strong>
                        {/* Renderizado condicional del nombre del recurso según su tipo */}
                        {selectedResource && selectedResource.resource_type === 'vehicle'
                            ? (selectedResource.resource_details as VehicleDetails).name
                            : selectedResource && selectedResource.resource_type === 'employee'
                                ? `${(selectedResource.resource_details as EmployeeDetails).first_name} ${(selectedResource.resource_details as EmployeeDetails).last_name
                                }`
                                : ''}
                    </strong>
                </p>
            </div>

            {/* Grupo de checkboxes para seleccionar campos de validación */}
            <Form.Item
                label={t('upload.validationFieldsLabel')}
                name="validationFields"
                rules={[
                    {
                        required: true,
                        message: t('upload.validationFieldsError'),
                    },
                ]}
            >
                <Checkbox.Group
                    options={
                        selectedDocType?.fields_to_validate?.map((field: FieldToValidate) => ({
                            label: `${field.name.charAt(0).toUpperCase() + field.name.slice(1)}`,
                            value: field.id.toString(),
                        })) || []
                    }
                    onChange={handleFieldsToValidateChange}
                    value={selectedFieldsToValidate}
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.3em' }}
                />
            </Form.Item>

            {/* Grupo de checkboxes para seleccionar campos de extracción */}
            <Form.Item label={t('upload.extractionFieldsLabel')} name="extractionFields">
                <Checkbox.Group
                    options={
                        selectedDocType?.fields_to_extract?.map((field: FieldToExtract) => ({
                            label: `${field.name.charAt(0).toUpperCase() + field.name.slice(1)}`,
                            value: field.id.toString(),
                        })) || []
                    }
                    onChange={handleFieldsToExtractChange}
                    value={selectedFieldsToExtract}
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.3em' }}
                />
            </Form.Item>

            {/* Botones de navegación */}
            <Form.Item>
                <Button type="primary" onClick={handleNext} style={{ marginRight: '8px' }}>
                    {t('upload.validateButton')}
                </Button>
                <Button onClick={handlePrev}>{t('upload.backButton')}</Button>
            </Form.Item>
        </>
    );
};

export default StepTwo;