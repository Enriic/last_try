import { CustomMenuDataItem } from './types';
import { PieChartOutlined } from '@ant-design/icons';
import React from 'react';


const employeesMenu: CustomMenuDataItem[] = [
    {
        path: '/employees',
        key: 'employees',
        name: 'menu.employees',
        icon: React.createElement(PieChartOutlined),
        roles: ['admin', 'staff', 'active'],
    },
];

export default employeesMenu;