// src/config/theme.ts

import { ThemeConfig } from 'antd';
import { lightThemeTokens, darkThemeTokens } from './tokens';

export const getTheme = (isDarkMode: boolean): ThemeConfig => {
    const tokens = isDarkMode ? darkThemeTokens : lightThemeTokens;

    return {
        token: {
            ...tokens.global,
        },
        // Puedes agregar tokens específicos de componentes si es necesario
        components: {
            Button: {
                ...tokens.components?.Button,
            },
            Card: {
                ...tokens.components?.Card,
            },
            Input: {
                ...tokens.components?.Input,
            }
            // ... otros componentes
        },
    };
};