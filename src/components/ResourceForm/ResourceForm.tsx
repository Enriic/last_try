/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Form, Select, Input, InputNumber, notification } from 'antd';
import JunoButton from '../common/JunoButton';
import { useTranslation } from 'react-i18next';
import CompanySelect from '../common/SearchableSelect/CompanySelect/CompanySelect';
import { JunoButtonTypes } from '../common/JunoButton/JunoButton.types';
import './ResourceForm.less';
import { ResourceType } from '../../types';
import { createResource } from '../../services/resourceService';
import CountrySelect from '../common/SearchableSelect/CountrySelect/CountrySelect';

const ResourceForm: React.FC = () => {
    const [resourceType, setResourceType] = useState<string | null>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [resourceForm] = Form.useForm();
    const { t } = useTranslation();

    const handleResourceTypeChange = (value: string) => {
        setResourceType(value);
    };

    const handleCompanyChange = (value: string | null) => {
        setCompanyId(value);
    };

    const onFinish = async (values: any) => {
        try {
            if (resourceType?.toLowerCase() === ResourceType.EMPLOYEE) {
                const phone = (values.phonePrefix || '') + (values.phoneNumber || '');
                const finalValues: any = {
                    ...values,
                    phone,
                };

                delete (finalValues as any).phonePrefix;
                delete (finalValues as any).phoneNumber;
            }


            await createResource(values);
            notification.success({
                message: t('notification.success.title'),
                description: t('notification.success.description'),
                duration: 3,
            });
            resourceForm.resetFields();
        } catch (error) {
            console.error('Error al crear el recurso', error);
            notification.error({
                message: t('notification.error.title'),
                description: t('notification.error.description'),
                duration: 3,
            });
        }
    };

    const onFinishFailed = (errorInfo: any) => {
        console.warn('Failed:', errorInfo);
    };

    return (
        <Form
            form={resourceForm}
            name="resourceForm"
            layout="vertical"
            style={{ backgroundColor: 'white', padding: '16px', borderRadius: '16px' }}
            labelCol={{ span: 8 }}
            wrapperCol={{ xs: { span: 24 }, sm: { span: 24 }, md: { span: 24 }, xl: { span: 16 }, xxl: { span: 10 } }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
        >
            <Form.Item
                label={t('Tipo de recurso')}
                name="resource_type"
                rules={[{ required: true, message: t('Por favor, selecciona el tipo de recurso') }]}
            >
                <Select
                    placeholder={t('Selecciona el tipo de recurso')}
                    onChange={handleResourceTypeChange}
                >
                    <Select.Option value="vehicle">{t('Vehicle')}</Select.Option>
                    <Select.Option value="employee">{t('Employee')}</Select.Option>
                </Select>
            </Form.Item>

            <Form.Item
                label={t('validationFilters.companyLabel')}
                name="company"
                rules={[{ required: true, message: t('validationFilters.companyRequiredMessage') }]}
            >
                <CompanySelect
                    value={companyId}
                    onChange={handleCompanyChange}
                    placeholder={t('validationFilters.companyPlaceholder')}
                    style={{ width: '100%' }}
                />
            </Form.Item>

            {resourceType?.toLowerCase() === ResourceType.VEHICLE && (
                <>
                    <Form.Item
                        label={t('resource_form.vehicle.vehicle_name.label')}
                        name="name"
                        rules={[{ required: true, message: t('resource_form.vehicle.vehicle_name.required_message') }]}
                    >
                        <Input placeholder={t('resource_form.vehicle.vehicle_name.placeholder')} />
                    </Form.Item>

                    <Form.Item
                        label={t('resource_form.vehicle.manufacturer.label')}
                        name="manufacturer"
                        rules={[{ required: true, message: t('resource_form.vehicle.manufacturer.required_message') }]}
                    >
                        <Input placeholder={t('resource_form.vehicle.manufacturer.placeholder')} />
                    </Form.Item>

                    <Form.Item
                        label={t('resource_form.vehicle.registration_id.label')}
                        name="registration_id"
                        rules={[{ required: true, message: t('resource_form.vehicle.registration_id.required_message') }]}
                    >
                        <Input placeholder={t('resource_form.vehicle.registration_id.placeholder')} />
                    </Form.Item>

                    <Form.Item
                        label={t('resource_form.vehicle.model.label')}
                        name="model"
                        rules={[{ required: true, message: t('resource_form.vehicle.model.required_message') }]}
                    >
                        <Input placeholder={t('resource_form.vehicle.model.placeholder')} />
                    </Form.Item>

                    <Form.Item
                        label={t('resource_form.vehicle.weight.label')}
                        name="weight"
                        rules={[{ required: true, message: t('resource_form.vehicle.weight.required_message') }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder={t('resource_form.vehicle.weight.placeholder')}
                        />
                    </Form.Item>
                </>
            )}

            {resourceType?.toLowerCase() === ResourceType.EMPLOYEE && (
                <>
                    <Form.Item
                        label={t('resource_form.employee.first_name.label')}
                        name="first_name"
                        rules={[{ required: true, message: t('resource_form.employee.first_name.required_message') }]}
                    >
                        <Input placeholder={t('resource_form.employee.first_name.placeholder')} />
                    </Form.Item>

                    <Form.Item
                        label={t('resource_form.employee.last_name.label')}
                        name="last_name"
                        rules={[{ required: true, message: t('resource_form.employee.last_name.required_message') }]}
                    >
                        <Input placeholder={t('resource_form.employee.last_name.placeholder')} />
                    </Form.Item>

                    <Form.Item
                        label={t('resource_form.employee.email.label')}
                        name="email"
                        rules={[
                            { required: true, message: t('resource_form.employee.email.required_message') },
                            { type: 'email', message: t('resource_form.employee.email.invalid_format_message') },
                        ]}
                    >
                        <Input placeholder={t('resource_form.employee.email.placeholder')} />
                    </Form.Item>

                    <Form.Item label={t('company_form.phone.label')}>
                        <Input.Group style={{ display: 'inline-flex', gap: 5 }}>
                            <Form.Item
                                name="phonePrefix"
                                rules={[{ required: false }]}
                                style={{ width: '25%' }}
                            >
                                <CountrySelect placeholder='prefix' field='name,cioc,idd' extended></CountrySelect>
                            </Form.Item>
                            <Form.Item
                                name="phoneNumber"
                                rules={[{ required: false }]}
                                style={{ width: '75%' }}
                            >
                                <Input
                                    placeholder={t('company_form.phone.placeholder')}
                                />
                            </Form.Item>
                        </Input.Group>
                    </Form.Item>

                    <Form.Item
                        label={t('resource_form.employee.country.label')}
                        name="country"
                        rules={[{ required: true, message: t('resource_form.employee.country.required_message') }]}
                    >
                        <Input placeholder={t('resource_form.employee.country.placeholder')} />
                    </Form.Item>

                    <Form.Item
                        label={t('resource_form.employee.worker_id.label')}
                        name="worker_id"
                        rules={[{ required: true, message: t('resource_form.employee.worker_id.required_message') }]}
                    >
                        <Input placeholder={t('resource_form.employee.worker_id.placeholder')} />
                    </Form.Item>
                </>
            )}

            <Form.Item wrapperCol={{ offset: 0, span: 16 }}>
                <JunoButton buttonType={JunoButtonTypes.Ok} type="primary" htmlType="submit">
                    {t('Save')}
                </JunoButton>
            </Form.Item>
        </Form>
    );
};

export default ResourceForm;
