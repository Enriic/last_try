// src/components/EmployeeTable/EmployeeTable.tsx
// 
import React from 'react';
import { Table, Spin, Button } from 'antd';
import { Resource } from '../../../types';
import './EmployeeTable.less';
import { useTranslation } from 'react-i18next';
import { EditOutlined } from '@ant-design/icons';

{/* Interfaz para las propiedades de la tabla de empleados */ }
interface EmployeeTableProps {
    /* Lista de empleados a mostrar */
    employees: Resource[];
    /* Estado de carga de la tabla */
    loading: boolean;
    /* Función para manejar la visualización de detalles de un empleado */
    onViewDetails: (employee: Resource) => void;
    /* Configuración de paginación */
    pagination: {
        current: number;
        pageSize: number;
        total: number;
        onChange: (page: number, pageSize?: number) => void;
    };
}

{/* Componente para mostrar una tabla de empleados */ }
const EmployeeTable: React.FC<EmployeeTableProps> = ({
    employees,
    loading,
    pagination,
    onViewDetails,
}) => {
    {/* Hook para acceder a las funciones de traducción */ }
    const { t } = useTranslation();
    console.log('employees', employees);

    {/* Definición de columnas de la tabla */ }
    const columns = [
        {
            title: t('employee_table.date'),
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (text: string) => text ? new Date(text).toLocaleDateString() : '',
        },
        {
            title: t('employee_table.first_name'),
            dataIndex: ['resource_details', 'first_name'],
            key: 'first_name',
        },
        {
            title: t('employee_table.last_name'),
            dataIndex: ['resource_details', 'last_name'],
            key: 'last_name',
        },
        {
            title: t('employee_table.email'),
            dataIndex: ['resource_details', 'email'],
            key: 'email',
        },
        {
            title: t('employee_table.phone'),
            dataIndex: ['resource_details', 'phone'],
            key: 'phone',
        },
        {
            title: t('employee_table.worker_id'),
            dataIndex: ['resource_details', 'worker_id'],
            key: 'worker_id',
        },
        {
            key: 'actions',

            render: (_: any, record: Resource) => (
                <Button type="link" onClick={() => onViewDetails(record)}>
                    <EditOutlined />
                </Button>
            ),
        },
    ];

    {/* Muestra un indicador de carga si los datos están cargando */ }
    if (loading) {
        return <Spin />;
    }

    {/* Renderiza la tabla de empleados */ }
    return (
        <Table
            size="middle"
            className="history-validation-table"
            dataSource={employees}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={pagination}
        />
    );
};

export default EmployeeTable;