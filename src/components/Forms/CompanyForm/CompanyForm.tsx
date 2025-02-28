// src/components/CompanyForm/CompanyForm.tsx


/* eslint-disable @typescript-eslint/no-explicit-any */
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

interface CompanyFormProps {
    update?: boolean;
    company?: Company;
    onClose?: () => void;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ update, company, onClose }) => {
    const { t } = useTranslation();
    const [companyForm] = Form.useForm();
    const navigate = useNavigate();

    type FormValues = Omit<CompanyFormData, 'phone'> & {
        phonePrefix?: string;
        phoneNumber?: string;
    };

    useEffect(() => {
        if (update && company) {
            let phonePrefix = '';
            let phoneNumber = company.phone || '';

            const index = phoneNumber.indexOf(' ');
            if (index !== -1) {
                phonePrefix = phoneNumber.substring(0, index);
                phoneNumber = phoneNumber.substring(index + 1);
            }
            companyForm.setFieldsValue({ ...company, phonePrefix, phoneNumber });
        }
    }, [update, company, companyForm]);


    const onFinish = async (values: FormValues) => {
        try {
            // Combinar el prefijo y número en un solo campo "phone"
            const phone = (values.phonePrefix || '') + ' ' + (values.phoneNumber || '');
            const finalValues: CompanyFormData = {
                ...values,
                phone,
            };

            // Eliminar campos temporales
            delete (finalValues as any).phonePrefix;
            delete (finalValues as any).phoneNumber;

            if (update) {
                if (company) {
                    await updateCompany(company.id, finalValues);
                }
            } else {
                await createCompany(finalValues);
            }

            notification.success({
                message: t('notification.success.title'),
                description: t('notification.success.description'),
                duration: 3,
            });
            onClear();
            if (onClose) {
                onClose(); // Cierra el modal y actualiza la tabla
            } else {
                navigate('/companies'); // Si no hay modal, redirige a la lista
            }
        } catch (error) {
            console.error(update ? 'Error al actualizar la empresa' : 'Error al crear la empresa', error);
            notification.error({
                message: t('notification.error.title'),
                description: t('notification.error.description'),
                duration: 3,
            });
        }
    };

    const onClear = () => {
        companyForm.resetFields();
    };

    // Manejo de error en el formulario
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
            <Form.Item
                label={t('company_form.company_id.label')}
                name="company_id"
                rules={[{ required: true, message: t('company_form.company_id.required_message') }]}
            >
                <Input placeholder={t('company_form.company_id.placeholder')} />
            </Form.Item>

            <Form.Item
                label={t('company_form.company_name.label')}
                name="company_name"
                rules={[{ required: true, message: t('company_form.company_name.required_message') }]}
            >
                <Input placeholder={t('company_form.company_name.placeholder')} />
            </Form.Item>

            <Form.Item
                label={t('company_form.industry.label')}
                name="industry"
                rules={[{ required: false, message: t('company_form.industry.required_message') }]}
            >
                <Input placeholder={t('company_form.industry.placeholder')} />
            </Form.Item>

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

            <Form.Item
                label={t('company_form.location.label')}
                name="location"
                rules={[{ required: true, message: t('company_form.location.required_message') }]}
            >
                <CountrySelect placeholder={t('company_form.location.placeholder')} field="name" />
            </Form.Item>

            <Form.Item label={t('company_form.phone.label')}>
                <Input.Group style={{ display: 'inline-flex', gap: 5 }}>
                    <Form.Item name="phonePrefix" rules={[{ required: false }]} style={{ width: '25%' }}>
                        <CountrySelect placeholder={t('company_form.prefix.placeholder')} field="name,cioc,idd" extended />
                    </Form.Item>
                    <Form.Item name="phoneNumber" rules={[{ required: false }]} style={{ width: '75%' }}>
                        <Input placeholder={t('company_form.phone.placeholder')} />
                    </Form.Item>
                </Input.Group>
            </Form.Item>

            <Form.Item
                label={t('company_form.language.label')}
                name="language"
                rules={[{ required: false, message: t('company_form.language.required_message') }]}
            >
                <Input placeholder={t('company_form.language.placeholder')} />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 0, span: 16 }}>
                <JunoButton buttonType={JunoButtonTypes.Ok} type="primary" htmlType="submit">
                    {t('company_form.save')}
                </JunoButton>
            </Form.Item>
        </Form>
    );
};

export default CompanyForm;
