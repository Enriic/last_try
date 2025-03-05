// src/components/ValidationTable/vehicle_table.tsx
import React from 'react';
import { Table, Spin, Button } from 'antd';
import { VehicleDetails as Vehicle } from '../../../types';
import './VehicleTable.less';
import { useTranslation } from 'react-i18next';
import { EditOutlined } from '@ant-design/icons';

/**
 * Propiedades para el componente de tabla de vehículos
 */
interface VehicleTableProps {
    /* Lista de vehículos a mostrar */
    vehicles: Vehicle[];
    /* Estado de carga de la tabla */
    loading: boolean;
    /* Función para manejar la visualización de detalles de un vehículo */
    onViewDetails: (vehicle: Vehicle) => void;
    /* Configuración de paginación */
    pagination: {
        current: number;
        pageSize: number;
        total: number;
        onChange: (page: number, pageSize?: number) => void;
    };
}

/**
 * Componente para mostrar una tabla de vehículos
 */
const VehicleTable: React.FC<VehicleTableProps> = ({
    vehicles,
    loading,
    pagination,
    onViewDetails,
}) => {
    /* Hook para acceder a las funciones de traducción */
    const { t } = useTranslation();

    /* Definición de columnas de la tabla */
    const columns = [
        {
            title: t('vehicle_table.date'),
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (text: string) => text ? new Date(text).toLocaleDateString() : '',
        },
        {
            title: t('vehicle_table.vehicle_name'),
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: t('vehicle_table.manufacturer'),
            dataIndex: 'manufacturer',
            key: 'manufacturer',
        },
        {
            title: t('vehicle_table.registration_id'),
            dataIndex: 'registration_id',
            key: 'registration_id',
        },
        {
            title: t('vehicle_table.model'),
            dataIndex: 'model',
            key: 'model',
        },
        {
            title: t('vehicle_table.weight'),
            dataIndex: 'weight',
            key: 'weight',
        },
        {
            key: 'actions',
            /* Columna para acciones, muestra un botón para editar */
            render: (_: any, record: Vehicle) => (
                <Button type="link" onClick={() => onViewDetails(record)}>
                    <EditOutlined />
                </Button>
            ),
        },
    ];

    /* Muestra un indicador de carga si los datos están cargando */
    if (loading) {
        return <Spin />;
    }

    /* Renderiza la tabla de vehículos */
    return (
        <Table
            size="middle"
            className="vehicle-validation-table"
            dataSource={vehicles}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={pagination}
        />
    );
};

export default VehicleTable;