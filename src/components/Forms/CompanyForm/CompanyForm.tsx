// src/components/Forms/CompanyForm/CompanyForm.tsx

import React, { useEffect } from 'react';
import { Form, Input, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { JunoButtonTypes } from '../../common/JunoButton/JunoButton.types';
import JunoButton from '../../common/JunoButton';
import './CompanyForm.less';
import { createCompany, updateCompany } from '../../../services/companyService';
import CountrySelect from '../../common/SearchableSelect/CountrySelect/CountrySelect';
import { Company } from '../../../types';
import { CompanyFormData } from '../../../types/form';

/**
 * Props para el componente CompanyForm
 */
interface CompanyFormProps {
    update?: boolean;
    company?: Company;
    onClose?: () => void;
}

/**
 * Componente de formulario para crear o actualizar empresas
 * 
 * Permite la gestión de datos de empresas, incluyendo información de contacto
 * y localización con soporte para prefijos telefónicos internacionales.
 */
const CompanyForm: React.FC<CompanyFormProps> = ({ update, company, onClose }) => {
    // Obtener función de traducción para internacionalización
    const { t } = useTranslation();

    // Instancia del formulario para control programático
    const [companyForm] = Form.useForm();

    // Hook de navegación para redirigir tras completar acciones
    const navigate = useNavigate();

    /**
     * Tipo para los valores del formulario con campos separados para teléfono
     * Extiende CompanyFormData pero separa el teléfono en prefijo y número
     */
    type FormValues = Omit<CompanyFormData, 'phone'> & {
        phonePrefix?: string;
        phoneNumber?: string;
    };

    /**
     * Efecto para cargar los datos de la empresa cuando está en modo actualización
     * Separa el campo de teléfono en prefijo y número para facilitar la edición
     */
    useEffect(() => {
        if (update && company) {
            let phonePrefix = '';
            let phoneNumber = company.phone || '';

            // Separar el prefijo del número de teléfono si existe un espacio
            const index = phoneNumber.indexOf(' ');
            if (index !== -1) {
                phonePrefix = phoneNumber.substring(0, index);
                phoneNumber = phoneNumber.substring(index + 1);
            }

            // Establecer los valores iniciales en el formulario
            companyForm.setFieldsValue({ ...company, phonePrefix, phoneNumber });
        }
    }, [update, company, companyForm]);

    /**
     * Maneja el envío del formulario
     * Combina el prefijo y número telefónico, y realiza la creación o actualización
     * @param values Valores del formulario
     */
    const onFinish = async (values: FormValues) => {
        try {
            // Combinar el prefijo y número en un solo campo "phone"
            const phone = (values.phonePrefix || '') + ' ' + (values.phoneNumber || '');
            const finalValues: CompanyFormData = {
                ...values,
                phone,
            };

            // Eliminar campos temporales que no corresponden al modelo de la API
            delete (finalValues as any).phonePrefix;
            delete (finalValues as any).phoneNumber;

            // Ejecutar la operación correspondiente según sea actualización o creación
            (update && company) ? await updateCompany(company.id, finalValues) : await createCompany(finalValues);

            // Notificar éxito al usuario
            notification.success({
                message: t('notification.success.title'),
                description: t('notification.success.description'),
                duration: 3,
            });

            // Limpiar formulario y manejar navegación
            onClear();
            onClose ? onClose() : navigate('/companies');
        } catch (error) {
            console.error(update ? 'Error al actualizar la empresa' : 'Error al crear la empresa', error);

            // Notificar error al usuario
            notification.error({
                message: t('notification.error.title'),
                description: t('notification.error.description'),
                duration: 3,
            });
        }
    };

    /**
     * Limpia todos los campos del formulario
     */
    const onClear = () => {
        companyForm.resetFields();
    };

    /**
     * Maneja errores en la validación del formulario
     * @param errorInfo Información sobre los errores de validación
     */
    const onFinishFailed = (errorInfo: any) => {
        console.warn('Failed:', errorInfo);
    };

    return (
        <Form
            form={companyForm}
            style={{ backgroundColor: 'white', padding: 20, borderRadius: 16, border: '1px solid #f0f0f0' }}
            name="companyForm"
            layout="vertical"
            labelCol={{ span: 8 }}
            wrapperCol={{ xs: { span: 24 }, sm: { span: 24 }, md: { span: 24 }, xl: { span: 12 }, xxl: { span: 8 } }}
            initialValues={{ phonePrefix: '', phoneNumber: '' }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
        >
            {/* Campo para el ID de la empresa */}
            <Form.Item
                label={t('company_form.company_id.label')}
                name="company_id"
                rules={[{ required: true, message: t('company_form.company_id.required_message') }]}
            >
                <Input placeholder={t('company_form.company_id.placeholder')} />
            </Form.Item>

            {/* Campo para el nombre de la empresa */}
            <Form.Item
                label={t('company_form.company_name.label')}
                name="company_name"
                rules={[{ required: true, message: t('company_form.company_name.required_message') }]}
            >
                <Input placeholder={t('company_form.company_name.placeholder')} />
            </Form.Item>

            {/* Campo para la industria/sector */}
            <Form.Item
                label={t('company_form.industry.label')}
                name="industry"
                rules={[{ required: false, message: t('company_form.industry.required_message') }]}
            >
                <Input placeholder={t('company_form.industry.placeholder')} />
            </Form.Item>

            {/* Campo para el correo electrónico con validación de formato */}
            <Form.Item
                label={t('company_form.email.label')}
                name="email"
                rules={[
                    { required: false, message: t('company_form.email.required_message') },
                    { type: 'email', message: t('company_form.email.invalid_format_message') },
                ]}
            >
                <Input placeholder={t('company_form.email.placeholder')} />
            </Form.Item>

            {/* Campo para la ubicación (país) */}
            <Form.Item
                label={t('company_form.location.label')}
                name="location"
                rules={[{ required: true, message: t('company_form.location.required_message') }]}
            >
                <CountrySelect placeholder={t('company_form.location.placeholder')} field="name" />
            </Form.Item>

            {/* Campo de teléfono con prefijo internacional */}
            <Form.Item label={t('company_form.phone.label')}>
                <Input.Group style={{ display: 'inline-flex', gap: 5 }}>
                    {/* Prefijo telefónico con selector de país extendido */}
                    <Form.Item name="phonePrefix" rules={[{ required: false }]} style={{ width: '25%' }}>
                        <CountrySelect
                            placeholder={t('company_form.prefix.placeholder')}
                            field="name,cioc,idd"
                            extended
                        />
                    </Form.Item>
                    {/* Número de teléfono */}
                    <Form.Item name="phoneNumber" rules={[{ required: false }]} style={{ width: '75%' }}>
                        <Input placeholder={t('company_form.phone.placeholder')} />
                    </Form.Item>
                </Input.Group>
            </Form.Item>

            {/* Campo para el idioma preferido */}
            <Form.Item
                label={t('company_form.language.label')}
                name="language"
                rules={[{ required: false, message: t('company_form.language.required_message') }]}
            >
                <Input placeholder={t('company_form.language.placeholder')} />
            </Form.Item>

            {/* Botón de guardado */}
            <Form.Item wrapperCol={{ offset: 0, span: 16 }}>
                <JunoButton buttonType={JunoButtonTypes.Ok} type="primary" htmlType="submit">
                    {t('company_form.save')}
                </JunoButton>
            </Form.Item>
        </Form>
    );
};

export default CompanyForm;