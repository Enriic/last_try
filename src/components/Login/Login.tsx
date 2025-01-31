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


const LoginComponent = () => {
    const [loading, setLoading] = useState(false);
    const { login, user } = useAuth();
    const { t, i18n } = useTranslation();

    const navigate = useNavigate();

    if (user) return <Navigate to="/upload" replace />;

    const onFinish = async (values: LoginFormValues) => {
        setLoading(true);
        try {
            console.log('Logging in with:', values.username, values.password);
            await login(values.username, values.password);
            navigate('/upload', { replace: true }); // Redirige al home o a la ruta deseada
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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