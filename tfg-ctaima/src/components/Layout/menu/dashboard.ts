import { CustomMenuDataItem } from './types';
import { PieChartOutlined } from '@ant-design/icons';
import React from 'react';


const dashboardMenu: CustomMenuDataItem[] = [
    {
        path: '/dashboard',
        key: 'dashboard',
        name: 'menu.dashboard',
        icon: React.createElement(PieChartOutlined)
    },
];

export default dashboardMenu;