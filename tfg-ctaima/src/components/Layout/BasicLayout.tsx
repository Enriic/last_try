import React, { useState, useEffect, useLayoutEffect, ReactNode } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { ProLayout, ProSettings } from '@ant-design/pro-layout';
import { CustomMenuDataItem } from './menu/types'; // Importamos los tipos de menú
import menuItems from './menu'; // Importamos los menús definidos
import { Typography, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import './styles/Sidebar.less'

const { Text } = Typography;
const { Option } = Select;

interface BasicLayoutProps {
    children?: ReactNode;
}

// Importamos las imágenes del logo (asegúrate de que las rutas sean correctas)
// import imgLogo from '../../assets/logo.png';
// import imgLogoCollapsed from '../../assets/logo-collapsed.png';

const BasicLayout: React.FC<BasicLayoutProps> = () => {
    const navigate = useNavigate();
    const [pathname, setPathname] = useState<string>('/');
    const { t, i18n } = useTranslation();
    //const user = useAuth();
    //use mock user
    const user = {
        roles: ['admin'],

    };


    const userRoles = user.roles as string[];

    const location = useLocation();

    const [collapsed, setCollapsed] = useState<boolean>(false);
    //const [logoImg, setLogoImg] = useState<string>();

    // Obtenemos solo xs de useBreakpoint
    const { xs } = useBreakpoint();

    // Efecto para ajustar el logo según el breakpoint xs
    // useLayoutEffect(() => {
    //     if (xs && !logoImg) {
    //         setLogoImg(imgLogoCollapsed);
    //     } else if (!xs && !logoImg) {
    //         setLogoImg(imgLogo);
    //     }
    // }, [xs, logoImg]);

    // Ajustamos el colapso del menú en xs
    useEffect(() => {
        if (xs) {
            setCollapsed(true);
        } else {
            setCollapsed(false);
        }
    }, [xs]);

    // Filtramos los elementos del menú según los roles del usuario
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

    // Traducimos los nombres del menú
    const menuDataRender = (menuData: CustomMenuDataItem[]): CustomMenuDataItem[] =>
        menuData.map((item) => {
            const localItem = {
                ...item,
                name: t(item.name as string),
                children: item.children ? menuDataRender(item.children) : [],
            };
            return localItem;
        });

    // Renderizamos los elementos del menú
    const menuItemRender = (
        item: CustomMenuDataItem & { isUrl: boolean; onClick: () => void },
        defaultDom: React.ReactNode,
    ): React.ReactNode => (
        <div
            onClick={() => {
                setPathname(item.path || '/');
                navigate(item.path || '/');
            }}
            style={{ cursor: 'pointer' }}
        >
            <Text ellipsis>{defaultDom}</Text>
        </div>
    );

    // Botón para colapsar y expandir el menú
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

    // Selector de idioma
    const languageSelector = (
        <Select
            value={i18n.language}
            style={{ width: 120 }}
            onChange={(lng) => i18n.changeLanguage(lng)}
        >
            <Option value="es">Español</Option>
            <Option value="en">English</Option>
        </Select>
    );

    // Configuración de ProLayout
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
                path: '/',
                routes: finalMenuItems,
            }}
            onCollapse={(value: boolean) => setCollapsed(value)}
            menuDataRender={menuDataRender}
            menuItemRender={menuItemRender}
            location={location}
            title="Mi Aplicación"
            //logo={<img src={logoImg} alt="Logo" style={{ height: 32 }} />}
            siderWidth={228}
            headerRender={() => null}
            collapsedButtonRender={() => null}
            onMenuHeaderClick={() => {
                setPathname('/');
                navigate('/');
            }}
            breakpoint="xs"
        //collapsedWidth={xs ? 0 : 80}
        >
            {/* Botón para colapsar/expandir y selector de idioma */}
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
            {/* <div style={{ padding: 16 }}></div> */}

        </ProLayout>
    );
};

export default BasicLayout;