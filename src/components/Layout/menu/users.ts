import { CustomMenuDataItem } from './types';

const usersMenu: CustomMenuDataItem[] = [
    {
        path: '/users',
        key: 'users',
        name: 'menu.users',
        //icon: <UserOutlined />,
        roles: ['admin', 'editor'],
        children: [
            {
                path: '/users/list',
                key: 'usersList',
                name: 'menu.usersList',
                roles: ['admin', 'editor'],
            },
            {
                path: '/users/create',
                key: 'usersCreate',
                name: 'menu.usersCreate',
                roles: ['admin'],
            },
        ],
    },
];

export default usersMenu;