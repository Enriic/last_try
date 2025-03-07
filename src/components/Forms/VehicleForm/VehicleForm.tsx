import React, { useEffect } from 'react';
import { Form, Input, InputNumber, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import CompanySelect from '../../common/SearchableSelect/CompanySelect/CompanySelect';
import JunoButton from '../../common/JunoButton';
import { JunoButtonTypes } from '../../common/JunoButton/JunoButton.types';
import { createResource, updateResource } from '../../../services/resourceService';
import { Resource } from '../../../types';

interface VehicleResourceFormProps {
    update: boolean;
    vehicle?: Resource
    onClose?: () => void;
}

const VehicleResourceForm: React.FC<VehicleResourceFormProps> = ({ update, vehicle, onClose }) => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [vehicleForm] = Form.useForm();
    const { t } = useTranslation();

    useEffect(() => {
        if (update && vehicle) {
            vehicleForm.setFieldsValue({ ...vehicle });
        }
    }, [update, vehicle, vehicleForm]);

    const onFinish = async (values: any) => {
        try {
            const finalValues = {
                ...values,
                resource_type: 'vehicle' // Se asigna el tipo de recurso
            };

            (update && vehicle) ? await updateResource(vehicle.id, finalValues) : await createResource(finalValues);
            
            notification.success({
                message: t('notification.success.title'),
                description: t('notification.success.description'),
                duration: 3,
            });
            form.resetFields();

            onClose ? onClose() : navigate('/resources/vehicles');
            
        } catch (error) {
            console.error('Error al crear el recurso vehicle', error);
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
            name="vehicleResourceForm"
            layout="vertical"
            style={{ backgroundColor: 'white', padding: '16px', borderRadius: '16px' }}
            labelCol={{ span: 8 }}
            wrapperCol={{ xs: { span: 24 }, sm: { span: 24 }, md: { span: 24 }, xl: { span: 16 }, xxl: { span: 10 } }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
        >
            {/* Campo común: Selección de compañía */}
            <Form.Item
                label={t('validationFilters.companyLabel')}
                name="company"
                rules={[{ required: true, message: t('validationFilters.companyRequiredMessage') }]}
            >
                <CompanySelect
                    placeholder={t('validationFilters.companyPlaceholder')}
                    style={{ width: '100%' }}
                />
            </Form.Item>

            {/* Campos propios de Vehicle */}
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
                <InputNumber style={{ width: '100%' }} placeholder={t('resource_form.vehicle.weight.placeholder')} />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 0, span: 16 }}>
                <JunoButton buttonType={JunoButtonTypes.Ok} type="primary" htmlType="submit">
                    {t('Save')}
                </JunoButton>
            </Form.Item>
        </Form>
    );
};

export default VehicleResourceForm;
