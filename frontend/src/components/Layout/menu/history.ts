import { CustomMenuDataItem } from './types';
import { HistoryOutlined } from '@ant-design/icons';
import React from 'react';

const historyMenu: CustomMenuDataItem[] = [
    {
        path: '/history',
        key: 'history',
        name: 'menu.history',
        icon: React.createElement(HistoryOutlined),
        roles: ['admin', 'staff', 'active'],
    },
];

export default historyMenu;