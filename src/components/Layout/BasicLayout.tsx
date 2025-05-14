import React, { useState, useEffect, ReactNode } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { ProLayout, ProSettings } from '@ant-design/pro-layout';
import { CustomMenuDataItem } from './menu/types'; // Importamos los tipos de menú
import menuItems from './menu'; // Importamos los menús definidos
import { Typography, Select, Modal, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import './styles/Sidebar.less'

const { Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

{/* Interfaz que define las propiedades para el componente de layout */ }
interface BasicLayoutProps {
    children?: ReactNode;
}

{/* 
 * Componente principal de layout para toda la aplicación
 * Proporciona la estructura, navegación y elementos comunes para todas las páginas
 */}
const BasicLayout: React.FC<BasicLayoutProps> = () => {
    const navigate = useNavigate();
    const [pathname, setPathname] = useState<string>('/');
    const { t, i18n } = useTranslation();
    const { logout, user } = useAuth();

    {/* Maneja el proceso de cierre de sesión */ }
    const handleLogout = async () => {
        try {
            await logout();
            notification.success({
                message: t('logout.success.message'),
                description: t('logout.success.description'),
                duration: 3,
            });
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            notification.error({
                message: t('logout.error.message'),
                description: t('logout.error.description'),
                duration: 3,
            });
        }
    };

    {/* Muestra un diálogo de confirmación antes de cerrar sesión */ }
    const showLogoutConfirm = () => {
        confirm({
            title: t('logout.confirmation.title'),
            content: t('logout.confirmation.content'),
            okText: t('logout.confirmation.confirm'),
            okType: 'danger',
            cancelText: t('logout.confirmation.cancel'),
            onOk() {
                handleLogout();
            },
            onCancel() {
                console.log('Cierre de sesión cancelado');
            },
        });
    };

    const userRoles = user?.roles as string[] || [];

    const location = useLocation();

    {/* Estado para controlar el colapso del menú lateral */ }
    const [collapsed, setCollapsed] = useState<boolean>(false);

    {/* Hook para detectar el tamaño de pantalla */ }
    const { xs } = useBreakpoint();

    {/* Colapsa automáticamente el menú en pantallas pequeñas */ }
    useEffect(() => {
        xs ? setCollapsed(true) : setCollapsed(false);
    }, [xs]);

    {/* Filtra los elementos del menú según los roles del usuario */ }
    const filterMenuItemsByRoles = (items: CustomMenuDataItem[]): CustomMenuDataItem[] =>
        items
            .filter((item) => {
                if (item.roles) {
                    return item.roles.some((role) => userRoles.includes(role));
                }
                return true;
            })
            .map((item) => {
                const newItem = { ...item };
                if (newItem.children) {
                    newItem.children = filterMenuItemsByRoles(newItem.children);
                }
                return newItem;
            });

    {/* Aplica el filtro de roles al menú */ }
    const finalMenuItems = filterMenuItemsByRoles(menuItems);

    {/* Añade la opción de cerrar sesión al menú si el usuario está autenticado */ }
    if (user) {
        finalMenuItems.push({
            path: '/logout',
            key: 'logout',
            name: 'menu.logout',
            icon: React.createElement(LogoutOutlined),
        });
    }

    {/* Aplica traducciones a los elementos del menú */ }
    const menuDataRender = (menuData: CustomMenuDataItem[]): CustomMenuDataItem[] =>
        menuData.map((item) => {
            const localItem = {
                ...item,
                name: t(item.name as string),
                children: item.children ? menuDataRender(item.children) : [],
            };
            return localItem;
        });

    {/* Personaliza el renderizado de cada elemento del menú */ }
    const menuItemRender = (
        item: CustomMenuDataItem & { isUrl: boolean; onClick: () => void },
        defaultDom: React.ReactNode,
    ): React.ReactNode => {
        const handleMenuItemClick = () => {
            if (item.key === 'logout') {
                showLogoutConfirm();
            } else {
                setPathname(item.path || '/');
                navigate(item.path || '/');
            }
        };

        return (
            <div
                onClick={handleMenuItemClick}
                style={{ cursor: 'pointer' }}
            >
                <Text ellipsis>{defaultDom}</Text>
            </div>
        );
    };

    {/* Botón para colapsar/expandir el menú lateral */ }
    const toggleMenu = (
        <div
            onClick={() => setCollapsed(!collapsed)}
            style={{
                padding: '0 16px',
                fontSize: 18,
                cursor: 'pointer',
            }}
        >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
    );

    {/* Selector de idioma de la aplicación */ }
    const languageSelector = (
        <Select
            value={i18n.language}
            style={{ width: 120 }}
            onChange={(lng) => i18n.changeLanguage(lng)}
        >
            <Option value="es">{t('menu.language.es')}</Option>
            <Option value="en">{t('menu.language.en')}</Option>
        </Select>
    );

    {/* Configuración general del layout */ }
    const settings: ProSettings = {
        fixSiderbar: true,
        fixedHeader: true,
        layout: 'side',
        contentWidth: 'Fluid',
        navTheme: 'light',
    };

    return (
        <ProLayout
            {...settings}
            collapsed={collapsed}
            route={{
                path: '/upload',
                routes: finalMenuItems,
            }}
            onCollapse={(value: boolean) => setCollapsed(value)}
            menuDataRender={menuDataRender}
            menuItemRender={menuItemRender}
            location={location}
            title={t('menu.application_title')}
            siderWidth={228}
            headerRender={() => null}
            collapsedButtonRender={() => null}
            onMenuHeaderClick={() => {
                setPathname('/upload');
                navigate('/upload');
            }}
            breakpoint="xs"
        >
            {/* Barra superior con controles de navegación e idioma */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 16,
                    background: 'white',
                }}
            >
                {toggleMenu}
                <div style={{ flex: 1 }} />
                {languageSelector}
            </div>
            {/* Contenido principal de la página */}
            <Outlet />
        </ProLayout>
    );
};

export default BasicLayout;