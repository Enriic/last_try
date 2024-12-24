import { CustomMenuDataItem } from './types';
import { SettingOutlined } from '@ant-design/icons';

const settingsMenu: CustomMenuDataItem[] = [
    {
        path: '/settings',
        key: 'settings',
        name: 'menu.settings',
        //icon: <SettingOutlined />,
        roles: ['admin'],
    },
];

export default settingsMenu;