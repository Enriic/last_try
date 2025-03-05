// src/components/Forms/EmployeeForm/EmployeeForm.tsx

import React, { useEffect } from 'react';
import { Form, Input, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import JunoButton from '../../common/JunoButton';
import { JunoButtonTypes } from '../../common/JunoButton/JunoButton.types';
import CountrySelect from '../../common/SearchableSelect/CountrySelect/CountrySelect';
import { createEmployee, updateEmployee } from '../../../services/resourceService';
import { EmployeeDetails, Resource } from '../../../types';
import './EmployeeForm.less';

/**
 * Props para el componente EmployeeResourceForm
 */
interface EmployeeResourceFormProps {
    update?: boolean;
    employee?: Resource;
    onClose?: () => void;
}

/**
 * Componente de formulario para crear o actualizar empleados como recursos
 * 
 * Permite la gestión de datos de empleados, incluyendo información personal
 * y de contacto con soporte para prefijos telefónicos internacionales.
 */
const EmployeeResourceForm: React.FC<EmployeeResourceFormProps> = ({ update, employee, onClose }) => {
    // Instancia del formulario para control programático
    const [form] = Form.useForm();

    // Hook de navegación para redirigir tras completar acciones
    const navigate = useNavigate();

    // Obtener función de traducción para internacionalización
    const { t } = useTranslation();

    /**
     * Maneja la selección de país y actualiza automáticamente el prefijo telefónico
     * @param country Objeto con información del país seleccionado
     */
    const handleCountrySelect = (country: any) => {
        // Si se selecciona un país que contiene información IDD (prefijo telefónico)
        if (country && country.idd) {
            // Combinar la raíz del prefijo con el sufijo principal
            const prefix = `${country.idd.root}${country.idd.suffixes?.[0] || ""}`;
            // Establecer automáticamente el prefijo en el campo correspondiente
            form.setFieldValue('phonePrefix', prefix);
        }
    };

    /**
     * Efecto para cargar los datos del empleado cuando está en modo actualización
     * Separa el campo de teléfono en prefijo y número para facilitar la edición
     */
    useEffect(() => {
        if (update && employee) {
            // Obtener los detalles específicos del recurso tipo empleado
            const details = employee.resource_details as EmployeeDetails;

            // Inicializar variables para separar el prefijo del número
            let phonePrefix = '';
            let phoneNumber = details.phone || '';

            // Separar el prefijo del número si existe un espacio
            const index = phoneNumber.indexOf(' ');
            if (index !== -1) {
                phonePrefix = phoneNumber.substring(0, index);
                phoneNumber = phoneNumber.substring(index + 1);
            }

            // Establecer todos los valores en el formulario, incluyendo prefijo y número separados
            form.setFieldsValue({
                // company: employee.company, // Comentado: posiblemente funcionalidad futura
                ...details,
                phonePrefix,
                phoneNumber,
            });
        }
    }, [update, employee, form]);

    /**
     * Maneja el envío del formulario
     * Combina el prefijo y número telefónico, y realiza la creación o actualización
     * @param values Valores del formulario
     */
    const onFinish = async (values: any) => {
        try {
            // Combinar el prefijo y número en un solo campo "phone"
            const phone = (values.phonePrefix || '') + ' ' + (values.phoneNumber || '');

            // Preparar objeto final para enviar a la API
            const finalValues = {
                resource_type: 'employee', // Tipo fijo para este formulario
                phone,
                ...values
            };

            // Eliminar campos temporales que no corresponden al modelo de la API
            delete (finalValues as any).phonePrefix;
            delete (finalValues as any).phoneNumber;

            console.log('finalValues', finalValues);

            // Ejecutar la operación correspondiente según sea actualización o creación
            if (update && employee) {
                await updateEmployee(employee.id, finalValues);
            } else {
                await createEmployee(finalValues);
            }

            // Notificar éxito al usuario
            notification.success({
                message: t('notification.success.title'),
                description: t('notification.success.description'),
                duration: 3,
            });

            // Limpiar formulario
            form.resetFields();

            // Manejar navegación según contexto
            if (onClose) {
                onClose(); // Si se usa en modal, cerrar y actualizar lista
            } else {
                navigate('/resources/employees'); // Si no, navegar a la lista de empleados
            }

        } catch (error) {
            console.error('Error al crear el recurso employee', error);
            // Notificar error al usuario
            notification.error({
                message: t('notification.error.title'),
                description: t('notification.error.description'),
                duration: 3,
            });
        }
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

            {/* Campo para el nombre (first name) del empleado */}
            <Form.Item
                label={t('resource_form.employee.first_name.label')}
                name="first_name"
                rules={[{ required: true, message: t('resource_form.employee.first_name.required_message') }]}
            >
                <Input placeholder={t('resource_form.employee.first_name.placeholder')} />
            </Form.Item>

            {/* Campo para el apellido (last name) del empleado */}
            <Form.Item
                label={t('resource_form.employee.last_name.label')}
                name="last_name"
                rules={[{ required: true, message: t('resource_form.employee.last_name.required_message') }]}
            >
                <Input placeholder={t('resource_form.employee.last_name.placeholder')} />
            </Form.Item>

            {/* Campo para el email con validación de formato */}
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

            {/* Campo para el país con auto-selección de prefijo telefónico */}
            <Form.Item
                label={t('resource_form.employee.country.label')}
                name="country"
                rules={[{ required: true, message: t('resource_form.employee.country.required_message') }]}
            >
                <CountrySelect
                    placeholder={t('resource_form.employee.country.placeholder')}
                    field="name,cioc,idd"
                    onCountrySelect={handleCountrySelect} // Callback para actualizar el prefijo automáticamente
                />
            </Form.Item>

            {/* Campo de teléfono con prefijo internacional */}
            <Form.Item label={t('resource_form.employee.phone.label')} style={{ marginBottom: 0 }}>
                <Input.Group style={{ display: 'inline-flex', gap: 5 }}>
                    {/* Selector de prefijo telefónico con modo extendido */}
                    <Form.Item name="phonePrefix" rules={[{ required: false }]} style={{ width: '25%' }}>
                        <CountrySelect
                            placeholder={t('resource_form.employee.prefix.placeholder')}
                            field="name,cioc,idd"
                            extended // Mostrar códigos IDD en las opciones
                        />
                    </Form.Item>
                    {/* Número de teléfono */}
                    <Form.Item name="phoneNumber" rules={[{ required: false }]} style={{ width: '75%' }}>
                        <Input placeholder={t('resource_form.employee.phone.placeholder')} />
                    </Form.Item>
                </Input.Group>
            </Form.Item>

            {/* Campo para el ID de trabajador interno */}
            <Form.Item
                label={t('resource_form.employee.worker_id.label')}
                name="worker_id"
                rules={[{ required: true, message: t('resource_form.employee.worker_id.required_message') }]}
            >
                <Input placeholder={t('resource_form.employee.worker_id.placeholder')} />
            </Form.Item>

            {/* Botón de guardado */}
            <Form.Item wrapperCol={{ offset: 0, span: 16 }}>
                <JunoButton buttonType={JunoButtonTypes.Ok} type="primary" htmlType="submit">
                    {t('Save')}
                </JunoButton>
            </Form.Item>
        </Form>
    );
};

export default EmployeeResourceForm;