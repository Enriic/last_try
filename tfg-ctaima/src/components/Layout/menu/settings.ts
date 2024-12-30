import { CustomMenuDataItem } from './types';
import { SettingOutlined } from '@ant-design/icons';
import React from 'react';

const settingsMenu: CustomMenuDataItem[] = [
    {
        path: '/settings',
        key: 'settings',
        name: 'menu.settings',
        icon: React.createElement(SettingOutlined),
        roles: ['admin', 'staff', 'active'],
    },
];

export default settingsMenu;