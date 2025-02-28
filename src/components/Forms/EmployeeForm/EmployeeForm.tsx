// src/components/EmployeeForm/EmployeeForm.tsx

import React, { useEffect } from 'react';
import { Form, Input, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import JunoButton from '../../common/JunoButton';
import { JunoButtonTypes } from '../../common/JunoButton/JunoButton.types';
import CountrySelect from '../../common/SearchableSelect/CountrySelect/CountrySelect';
import { createEmployee, updateEmployee } from '../../../services/resourceService';
import { EmployeeDetails, Resource } from '../../../types';
import CompanySelect from '../../common/SearchableSelect/CompanySelect/CompanySelect';
import './EmployeeForm.less';

// Definimos un tipo para la creación de un Resource sin id y timestamp
interface EmployeeResourceFormProps {
    update?: boolean;
    employee?: Resource;
    onClose?: () => void;
}

const EmployeeResourceForm: React.FC<EmployeeResourceFormProps> = ({ update, employee, onClose }) => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        if (update && employee) {
            const details = employee.resource_details as EmployeeDetails;
            let phonePrefix = '';
            let phoneNumber = details.phone || '';
            const index = phoneNumber.indexOf(' ');
            if (index !== -1) {
                phonePrefix = phoneNumber.substring(0, index);
                phoneNumber = phoneNumber.substring(index + 1);
            }
            form.setFieldsValue({
                // company: employee.company,
                ...details,
                phonePrefix,
                phoneNumber,
            });
        }
    }, [update, employee, form]);

    const onFinish = async (values: any) => {
        try {
            const phone = (values.phonePrefix || '') + ' ' + (values.phoneNumber || '');

            const finalValues = {
                resource_type: 'employee',
                phone,
                ...values
            };

            delete (finalValues as any).phonePrefix;
            delete (finalValues as any).phoneNumber;

            console.log('finalValues', finalValues);

            if (update) {
                if (employee) {
                    await updateEmployee(employee.id, finalValues);
                }
            } else {
                await createEmployee(finalValues);
            }
            notification.success({
                message: t('notification.success.title'),
                description: t('notification.success.description'),
                duration: 3,
            });
            form.resetFields();
            if (onClose) {
                onClose();
            } else {
                navigate('/resources/employees');
            }
        } catch (error) {
            console.error('Error al crear el recurso employee', error);
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
            form={form}
            name="employeeResourceForm"
            layout="vertical"
            style={{ backgroundColor: 'white', padding: '16px', borderRadius: '16px' }}
            labelCol={{ span: 8 }}
            wrapperCol={{ xs: { span: 24 }, sm: { span: 24 }, md: { span: 24 }, xl: { span: 16 }, xxl: { span: 10 } }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
        >
            {/* Campo común: Selección de compañía */}
            {/* <Form.Item
                label={t('resource_form.employee.company.label')}
                name="company"
                rules={[{ required: true, message: t('resource_form.employee.company.requiredMessage') }]}
            >
                <CompanySelect placeholder={t('resource_form.employee.company.placeholder')} style={{ width: '100%' }} />
            </Form.Item> */}

            {/* Campos propios de Employee */}
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

            <Form.Item label={t('resource_form.employee.phone.label')} style={{ marginBottom: 0 }}>
                <Input.Group style={{ display: 'inline-flex', gap: 5 }}>
                    <Form.Item name="phonePrefix" rules={[{ required: false }]} style={{ width: '25%' }}>
                        <CountrySelect
                            placeholder={t('resource_form.employee.prefix.placeholder')}
                            field="name,cioc,idd"
                            extended
                        />
                    </Form.Item>
                    <Form.Item name="phoneNumber" rules={[{ required: false }]} style={{ width: '75%' }}>
                        <Input placeholder={t('resource_form.employee.phone.placeholder')} />
                    </Form.Item>
                </Input.Group>
            </Form.Item>

            <Form.Item
                label={t('resource_form.employee.country.label')}
                name="country"
                rules={[{ required: true, message: t('resource_form.employee.country.required_message') }]}
            >
                <CountrySelect placeholder={t('resource_form.employee.country.placeholder')} field="name" />
            </Form.Item>

            <Form.Item
                label={t('resource_form.employee.worker_id.label')}
                name="worker_id"
                rules={[{ required: true, message: t('resource_form.employee.worker_id.required_message') }]}
            >
                <Input placeholder={t('resource_form.employee.worker_id.placeholder')} />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 0, span: 16 }}>
                <JunoButton buttonType={JunoButtonTypes.Ok} type="primary" htmlType="submit">
                    {t('Save')}
                </JunoButton>
            </Form.Item>
        </Form>
    );
};

export default EmployeeResourceForm;
