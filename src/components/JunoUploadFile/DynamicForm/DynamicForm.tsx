// src/components/JunoUploadFile/DynamicForm/DynamicForm.tsx

import React from 'react';
import { Form } from 'antd';
import CompanySelect from '../../common/SearchableSelect/CompanySelect/CompanySelect';
import ResourceSelect from '../../common/SearchableSelect/ResourceSelect/ResourceSelect';
import { useTranslation } from 'react-i18next';

/**
 * Props para el componente DynamicInputs
 */
interface DynamicInputsProps {
    /** Arreglo que define qué inputs se deben renderizar (ej: ['company', 'resource']) */
    associatedEntities: string[];
    /** Indica si se está usando un documento existente (desactiva campos y validaciones) */
    useExistingDocument: boolean;
    companyId: string | null;
    resource: string | null;
    handleCompanyChange: (value: string | null) => void;
    handleResourceChange: (value: string | null) => void;
}

/**
 * Componente que renderiza campos de formulario dinámicamente según entidades asociadas
 * 
 * Genera los inputs necesarios para asociar documentos a distintas entidades como
 * compañías o recursos, controlando su estado, validación y accesibilidad.
 */
const DynamicInputs: React.FC<DynamicInputsProps> = ({
    associatedEntities,
    useExistingDocument,
    companyId,
    resource,
    handleCompanyChange,
    handleResourceChange,
}) => {
    const { t } = useTranslation();

    /**
     * Registro de componentes de input indexados por tipo de entidad
     * Cada clave representa una entidad posible y su valor es el componente a renderizar
     */
    const inputComponents: Record<string, JSX.Element> = {
        /**
         * Selector de compañía con validación condicional
         * La validación solo es requerida cuando no se usa un documento existente
         */
        company: (
            <Form.Item
                key="company"
                label={t('upload.companyLabel')}
                name="company"
                rules={[
                    {
                        required: !useExistingDocument, // Solo requerido si no es documento existente
                        message: t('upload.companyError'),
                    },
                ]}
            >
                <CompanySelect
                    value={companyId}
                    onChange={handleCompanyChange}
                    placeholder={t('upload.companyPlaceholder')}
                    disabled={useExistingDocument} // Deshabilitar si ya existe el documento
                />
            </Form.Item>
        ),

        /**
         * Selector de recurso con validación condicional
         * La validación solo es requerida cuando no se usa un documento existente
         */
        resource: (
            <Form.Item
                key="resource"
                label={t('upload.resourceLabel')}
                name="resource"
                rules={[
                    {
                        required: !useExistingDocument, // Solo requerido si no es documento existente
                        message: t('upload.resourceError'),
                    },
                ]}
            >
                <ResourceSelect
                    value={resource}
                    onChange={handleResourceChange}
                    placeholder={t('upload.resourcePlaceholder')}
                    disabled={useExistingDocument} // Deshabilitar si ya existe el documento
                />
            </Form.Item>
        ),
        // Este patrón permite añadir más tipos de entidades de forma modular
    };

    /**
     * Renderiza solo los componentes solicitados según el array associatedEntities
     * Si una entidad no existe en el registro, se omite (retorna null)
     */
    return (
        <>
            {associatedEntities.map((entity) => inputComponents[entity] || null)}
        </>
    );
};

export default DynamicInputs;