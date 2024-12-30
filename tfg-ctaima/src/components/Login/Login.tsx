// src/components/Login/LoginComponent.tsx

import React, { useState } from 'react';
import { Input, Form, message } from 'antd';
import JunoButton from '../common/JunoButton/JunoButton';
import { JunoButtonTypes } from '../common/JunoButton/JunoButton.types';
import { LoginFormValues } from './Login.types';
import { useAuth } from '../../context/AuthContext';
import { ValidateErrorEntity } from 'rc-field-form/lib/interface';
import { Navigate, useNavigate } from 'react-router-dom';


const LoginComponent = () => {
    const [loading, setLoading] = useState(false);
    const { login, user } = useAuth();
    const navigate = useNavigate();

    if (user) return <Navigate to="/" replace />;
    
    const onFinish = async (values: LoginFormValues) => {
        setLoading(true);
        try {
            await login(values.username, values.password);
            message.success('¡Inicio de sesión exitoso!');
            navigate('/upload', { replace: true }); // Redirige al home o a la ruta deseada
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Error al iniciar sesión:', error);
            message.error(error.response?.data?.error || 'Error al iniciar sesión.');
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = (errorInfo: ValidateErrorEntity<LoginFormValues>) => {
        console.log('Error:', errorInfo);
        message.error('Por favor, verifica los campos del formulario e inténtalo de nuevo.');
    };

    return (
        <div style={{ maxWidth: 400, margin: '0 auto', padding: '2em' }}>
            <Form<LoginFormValues>
                name="loginForm"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                layout="vertical"
            >
                <Form.Item
                    label="Usuario"
                    name="username"
                    rules={[
                        { required: true, message: '¡Por favor, ingresa tu nombre de usuario!' },
                    ]}
                >
                    <Input placeholder="Ingresa tu nombre de usuario" />
                </Form.Item>

                <Form.Item
                    label="Contraseña"
                    name="password"
                    rules={[
                        { required: true, message: '¡Por favor, ingresa tu contraseña!' },
                    ]}
                >
                    <Input.Password placeholder="Ingresa tu contraseña" />
                </Form.Item>

                <Form.Item>
                    <JunoButton
                        type="primary"
                        buttonType={JunoButtonTypes.Ok}
                        htmlType="submit"
                        loading={loading}
                        block
                    >
                        Iniciar Sesión
                    </JunoButton>
                </Form.Item>
            </Form>
        </div>
    );
};

export default LoginComponent;