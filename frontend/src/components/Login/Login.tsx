// src/components/Login/LoginComponent.tsx

import React, { useState } from 'react';
import { Input, Form, notification } from 'antd';
import JunoButton from '../common/JunoButton/JunoButton';
import { JunoButtonTypes } from '../common/JunoButton/JunoButton.types';
import { LoginFormValues } from './Login.types';
import { useAuth } from '../../context/AuthContext';
import { ValidateErrorEntity } from 'rc-field-form/lib/interface';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';

{/* Componente para la página de inicio de sesión */ }
const LoginComponent = () => {
    {/* Estado para controlar la carga durante el inicio de sesión */ }
    const [loading, setLoading] = useState(false);
    {/* Hook para acceder a las funciones de autenticación */ }
    const { login, user } = useAuth();
    {/* Hook para acceder a las funciones de traducción */ }
    const { t } = useTranslation();

    {/* Hook para la navegación */ }
    const navigate = useNavigate();

    {/* Redirige al usuario a la página de carga si ya está autenticado */ }
    if (user) return <Navigate to="/upload" replace />;

    {/* Función que se ejecuta al enviar el formulario */ }
    const onFinish = async (values: LoginFormValues) => {
        setLoading(true);
        try {
            {/* Llama a la función de inicio de sesión del contexto de autenticación */ }
            await login(values.username, values.password);
            {/* Redirige al usuario a la página de carga después del inicio de sesión */ }
            navigate('/upload', { replace: true });

        } catch (error: any) {
            console.error('Error al iniciar sesión:', error);
            notification.error({
                message: 'Upps! Something went wrong',
                description: 'An error occurred while logging in',
                duration: 3,
            });
        } finally {
            setLoading(false);
        }
    };

    {/* Función que se ejecuta si falla la validación del formulario */ }
    const onFinishFailed = (errorInfo: ValidateErrorEntity<LoginFormValues>) => {
        console.log('Error:', errorInfo);
        notification.error({
            message: 'Upps! Something went wrong',
            description: 'Some fields are missing or have errors',
            duration: 3,
        });
    };

    return (
        <div style={{ maxWidth: 400, margin: '0 auto', padding: '2em' }}>
            {/* Formulario de inicio de sesión */}
            <Form<LoginFormValues>
                name={t('login.form_name')}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                layout="vertical"
            >
                <Form.Item
                    label={t('login.form.username.label')}
                    name='username'
                    rules={[
                        { required: true, message: `${t('login.form.username.rules.required_message')}` },
                    ]}
                >
                    <Input placeholder={t('login.form.username.placeholder')} />
                </Form.Item>

                <Form.Item
                    label={t('login.form.password.label')}
                    name='password'
                    rules={[
                        { required: true, message: `${t('login.form.password.rules.required_message')}` },
                    ]}
                >
                    <Input.Password placeholder={t('login.form.password.placeholder')} />
                </Form.Item>

                {/* Botón de envío del formulario */}
                <Form.Item>
                    <JunoButton
                        type="primary"
                        buttonType={JunoButtonTypes.Ok}
                        htmlType="submit"
                        loading={loading}
                        block
                    >
                        {t('login.submit')}
                    </JunoButton>
                </Form.Item>
            </Form>
        </div>
    );
};

export default LoginComponent;