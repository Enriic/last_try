import { CustomMenuDataItem } from './types';
import { PlusCircleOutlined } from '@ant-design/icons';
import React from 'react';

const companiesMenu: CustomMenuDataItem[] = [
    {
        path: '/companies',
        key: 'companies',
        name: 'menu.companies',
        icon: React.createElement(PlusCircleOutlined),
        roles: ['admin', 'staff', 'active'],
    },
];

export default companiesMenu;