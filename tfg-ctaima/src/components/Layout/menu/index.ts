// src/components/Layout/menu/index.ts

import { CustomMenuDataItem } from './types';
import dashboardMenu from './dashboard';
import usersMenu from './upload';
import settingsMenu from './history';
import uploadMenu from './upload';
import historyMenu from './history';
import logoutMenu from './logout';

const menuItems: CustomMenuDataItem[] = [
    ...dashboardMenu,
    ...uploadMenu,
    ...historyMenu,
    // ...usersMenu,
    // ...settingsMenu
];

export default menuItems;