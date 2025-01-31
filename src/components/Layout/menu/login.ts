import { CustomMenuDataItem } from './types';
import { LoginOutlined } from '@ant-design/icons';
import React from 'react';


const loginMenu: CustomMenuDataItem[] = [
    {
        path: '/login',
        key: 'login',
        name: 'menu.login',
        icon: React.createElement(LoginOutlined),
        roles: ['admin', 'staff', 'active'],
    },
];

export default loginMenu;