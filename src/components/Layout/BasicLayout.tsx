import React, { useState, useEffect, ReactNode } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { ProLayout, ProSettings } from '@ant-design/pro-layout';
import { CustomMenuDataItem } from './menu/types'; // Importamos los tipos de menú
import menuItems from './menu'; // Importamos los menús definidos
import { Typography, Select, message, Modal, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import './styles/Sidebar.less'

const { Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

interface BasicLayoutProps {
    children?: ReactNode;
}

const BasicLayout: React.FC<BasicLayoutProps> = () => {
    const navigate = useNavigate();
    const [pathname, setPathname] = useState<string>('/');
    const { t, i18n } = useTranslation();
    const { logout, user } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            notification.success({
                message: t('logout.success.message'), // Traducido
                description: t('logout.success.description'), // Traducido
                duration: 3,
            });
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            notification.error({
                message: t('logout.error.message'), // Traducido
                description: t('logout.error.description'), // Traducido
                duration: 3,
            });
        }
    };

    const showLogoutConfirm = () => {
        confirm({
            title: t('logout.confirmation.title'), // Traducido
            content: t('logout.confirmation.content'), // Traducido
            okText: t('logout.confirmation.confirm'), // Traducido
            okType: 'danger',
            cancelText: t('logout.confirmation.cancel'), // Traducido
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

    const [collapsed, setCollapsed] = useState<boolean>(false);

    const { xs } = useBreakpoint();

    useEffect(() => {
        if (xs) {
            setCollapsed(true);
        } else {
            setCollapsed(false);
        }
    }, [xs]);

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

    const finalMenuItems = filterMenuItemsByRoles(menuItems);

    if (user) {
        finalMenuItems.push({
            path: '/logout',
            key: 'logout',
            name: 'menu.logout',
            icon: React.createElement(LogoutOutlined),
        });
    }

    const menuDataRender = (menuData: CustomMenuDataItem[]): CustomMenuDataItem[] =>
        menuData.map((item) => {
            const localItem = {
                ...item,
                name: t(item.name as string),
                children: item.children ? menuDataRender(item.children) : [],
            };
            return localItem;
        });

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

    const languageSelector = (
        <Select
            value={i18n.language}
            style={{ width: 120 }}
            onChange={(lng) => i18n.changeLanguage(lng)}
        >
            <Option value="es">{t('menu.language.es')}</Option> {/* Traducido */}
            <Option value="en">{t('menu.language.en')}</Option> {/* Traducido */}
        </Select>
    );

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
                setPathname('/');
                navigate('/');
            }}
            breakpoint="xs"
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 16,
                    background: '#fff',
                }}
            >
                {toggleMenu}
                <div style={{ flex: 1 }} />
                {languageSelector}
            </div>
            <Outlet />
        </ProLayout>
    );
};

export default BasicLayout;
