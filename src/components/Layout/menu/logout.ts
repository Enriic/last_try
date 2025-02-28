import { CustomMenuDataItem } from './types';
import { LogoutOutlined } from '@ant-design/icons';
import React from 'react';

const logoutMenu: CustomMenuDataItem[] = [
    {
        path: '/Logout',
        key: 'logout',
        name: 'menu.logout',
        icon: React.createElement(LogoutOutlined),
        roles: ['admin', 'staff',  'active'],
    },
];

export default logoutMenu;