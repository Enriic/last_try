import { CustomMenuDataItem } from './types';
import { PieChartOutlined } from '@ant-design/icons';
import React from 'react';


const vehiclesMenu: CustomMenuDataItem[] = [
    {
        path: '/vehicles',
        key: 'vehicles',
        name: 'menu.vehicles',
        icon: React.createElement(PieChartOutlined),
        roles: ['admin', 'staff', 'active'],
    },
];

export default vehiclesMenu;