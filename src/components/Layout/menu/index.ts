// src/components/Layout/menu/index.ts

import { CustomMenuDataItem } from './types';
import dashboardMenu from './dashboard';

import settingsMenu from './settings';
import uploadMenu from './upload';
import historyMenu from './history';
import logoutMenu from './logout';
import resourcesMenu from './resources';
import companiesMenu from './companies';

const menuItems: CustomMenuDataItem[] = [
    ...uploadMenu,
    ...dashboardMenu,
    ...companiesMenu,
    ...resourcesMenu,
    ...historyMenu,

];

export default menuItems;