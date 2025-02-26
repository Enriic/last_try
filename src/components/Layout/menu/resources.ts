import { CustomMenuDataItem } from './types';
import { AppstoreAddOutlined } from '@ant-design/icons';
import React from 'react';

const resourcesMenu: CustomMenuDataItem[] = [
    {
        key: 'resources',
        name: 'menu.resources.label',
        icon: React.createElement(AppstoreAddOutlined),
        type: 'group',
        roles: ['admin', 'staff', 'active'],
        children: [
            {
                path: '/resources/employees',
                key: 'resources-employees',
                name: 'menu.resources.employees.label',
                roles: ['admin', 'staff', 'active'],
            },
            {
                path: '/resources/vehicles',
                key: 'resources-vehicles.label',
                name: 'menu.resources.vehicles.label',
                roles: ['admin', 'staff', 'active'],
            }
        ],
    },
];

export default resourcesMenu;