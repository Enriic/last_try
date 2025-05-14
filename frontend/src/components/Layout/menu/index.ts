// src/components/Layout/menu/index.ts

import { CustomMenuDataItem } from './types';
import dashboardMenu from './dashboard';
import uploadMenu from './upload';
import historyMenu from './history';
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