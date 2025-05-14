
// src/config/tokens.ts

import { Modal, Table } from "antd";
import { title } from "process";

const commonTokens = {
    global: {
        fontFamily: "'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
        fontWeight: '600',  // Peso de la fuente
        colorSuccess: "rgba(0, 227, 132, 1)",  // Color para éxito
        colorWarning: "#faad14",  // Color para advertencias
        colorError: "#f5222d",  // Color para errores
        borderRadiusBase: 16,  // Radio de los bordes
        borderWidthBase: "1px",  // Ancho del borde
        spaceXS: "8px",  // Espaciado pequeño (xs)
        spaceSM: "16px",  // Espaciado mediano (sm)
    },

    Button: {

    },

    Card: {

    },
    Input: {
        borderRadius: 16,
    },
    Select: {
        borderRadius: 16,
    },
    Table: {
        borderRadius: 16,
    },
    Modal: {
        borderRadius: 16,
        titleFontSize: 20,
    }
}


export const lightThemeTokens = {
    global: {
        ...commonTokens.global,
        colorPrimary: "#7346FF",  // Color primario
        colorText: "rgba(26, 48, 55, 0.85)",  // Color de texto principal
        colorTextSecondary: "rgba(26, 48, 55, 0.45)",  // Color de texto secundario
        colorDisabled: "rgba(26, 48, 55, 0.25)",  // Color para elementos deshabilitados
        colorProcessing: "#7346FF",  // Color para el estado de procesamiento
        colorLink: "#7346FF",  // Color de enlaces
        colorHeading: "rgba(0, 0, 0, 0.85)",  // Color de encabezados
        fontSizeBase: "14px",  // Tamaño base de la fuente
        borderColorBase: "#d9d9d9",  // Color base de los bordes
        borderColorSplit: "#f0f0f0",  // Color de los bordes de separación
        boxShadowBase: "0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)",  // Sombra base
        colorBgBase: "#f8f8f8",  // Color de fondo base
    },
    components: {
        Button: {
            ...commonTokens.Button,
        },

        Card: {
            ...commonTokens.Card,
        },
        Input: {
            ...commonTokens.Input,
        },
        Select: {
            ...commonTokens.Select,
            selectorBg: "fff",
        },
        Table: {
            ...commonTokens.Table,
            bodySortBg: "#fff",  // Color de fondo del cuerpo
        },
        Modal: {
            ...commonTokens.Modal,
        }


    }
    // Agrega más tokens según sea necesario
};


export const darkThemeTokens = {
    global: {
        ...commonTokens.global,
        colorPrimary: '#1890ff',
        colorBackground: '#141414',
        bodyBackground: "#fff",  // Color de fondo del cuerpo
        colorText: '#ffffff',
        fontSizeBase: 14,
    },
    components: {
        Button: {
            ...commonTokens.Button,
        },

        Card: {
            ...commonTokens.Card,
        },
        Input: {
            ...commonTokens.Input,
        },
        Select: {
            ...commonTokens.Select,
        },
        Table: {
            ...commonTokens.Table,
        },
        Modal: {
            ...commonTokens.Modal,
        }

    }
    // Agrega más tokens según sea necesario
};
