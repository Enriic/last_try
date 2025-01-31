import { MenuDataItem } from '@ant-design/pro-layout';

// Si necesitas agregar propiedades personalizadas, puedes hacer lo siguiente:
export interface CustomMenuDataItem extends MenuDataItem {
    roles?: string[];
    // Agrega otras propiedades si es necesario.
}