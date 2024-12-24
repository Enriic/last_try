// src/components/Layout/menu/upload.ts
import React from 'react';
import { CustomMenuDataItem } from './types';
import { UploadOutlined } from '@ant-design/icons';

const uploadMenu: CustomMenuDataItem[] = [
    {
        path: '/upload',
        key: 'upload',
        name: 'menu.upload',
        icon: React.createElement(UploadOutlined),
    },
];

export default uploadMenu;