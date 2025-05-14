import React from 'react';
import { Button } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
{/* Componente para el botón de cerrar sesión */ }
const LogoutButton: React.FC = () => {
    {/* Hook para acceder a la función de cerrar sesión */ }
    const { logout } = useAuth();
    const { t } = useTranslation();
    {/* Hook para la navegación */ }
    const navigate = useNavigate();

    {/* Función asíncrona para cerrar la sesión del usuario */ }
    const handleLogout = async () => {
        try {
            {/* Llama a la función de cerrar sesión del contexto de autenticación */ }
            await logout();
            {/* Redirige al usuario a la página de inicio de sesión */ }
            navigate('/login');
        } catch (error) {
            {/* Imprime un mensaje de error en la consola si falla el cierre de sesión */ }
            console.error('Error al cerrar sesión', error);
        }
    };

    return (
        <Button type = "primary" onClick = { handleLogout } >
            {t('logout.button')}
        </Button >
    );
};

export default LogoutButton;