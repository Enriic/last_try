// DynamicInputs.tsx
import React from 'react';
import { Form } from 'antd';
import CompanySelect from '../../common/SearchableSelect/CompanySelect/CompanySelect';
import ResourceSelect from '../../common/SearchableSelect/ResourceSelect/ResourceSelect';
import { useTranslation } from 'react-i18next';

interface DynamicInputsProps {
    associatedEntities: string[]; // Ejemplo: ['company', 'resource']
    useExistingDocument: boolean;
    companyId: string | null;
    resource: string | null;
    handleCompanyChange: (value: string | null) => void;
    handleResourceChange: (value: string | null) => void;
}

const DynamicInputs: React.FC<DynamicInputsProps> = ({
    associatedEntities,
    useExistingDocument,
    companyId,
    resource,
    handleCompanyChange,
    handleResourceChange,
}) => {
    const { t } = useTranslation();

    // Mapeo de cada tipo a su componente de input
    const inputComponents: Record<string, JSX.Element> = {
        company: (
            <Form.Item
                key="company"
                label={t('upload.companyLabel')}
                name="company"
                rules={[
                    {
                        required: !useExistingDocument,
                        message: t('upload.companyError'),
                    },
                ]}
            >
                <CompanySelect
                    value={companyId}
                    onChange={handleCompanyChange}
                    placeholder={t('upload.companyPlaceholder')}
                    disabled={useExistingDocument}
                />
            </Form.Item>
        ),
        resource: (
            <Form.Item
                key="resource"
                label={t('upload.resourceLabel')}
                name="resource"
                rules={[
                    {
                        required: !useExistingDocument,
                        message: t('upload.resourceError'),
                    },
                ]}
            >
                <ResourceSelect
                    value={resource}
                    onChange={handleResourceChange}
                    placeholder={t('upload.resourcePlaceholder')}
                    disabled={useExistingDocument}
                />
            </Form.Item>
        ),
        // Agrega más componentes según tus necesidades
    };

    return (
        <>
            {associatedEntities.map((entity) => inputComponents[entity] || null)}
        </>
    );
};

export default DynamicInputs;
