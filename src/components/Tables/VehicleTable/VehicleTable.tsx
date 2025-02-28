// src/components/ValidationTable/vehicle_table.tsx
import React from 'react';
import { Table, Spin, Button } from 'antd';
import { VehicleDetails as Vehicle } from '../../../types';
import './VehicleTable.less';
import { useTranslation } from 'react-i18next';
import { EditOutlined } from '@ant-design/icons';

interface VehicleTableProps {
    vehicles: Vehicle[];
    loading: boolean;
    onViewDetails: (vehicle: Vehicle) => void;
    pagination: {
        current: number;
        pageSize: number;
        total: number;
        onChange: (page: number, pageSize?: number) => void;
    };
}

const VehicleTable: React.FC<VehicleTableProps> = ({
    vehicles,
    loading,
    pagination,
    onViewDetails,
}) => {
    const { t } = useTranslation();

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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render: (_: any, record: Vehicle) => (
                <Button type="link" onClick={() => onViewDetails(record)}>
                    <EditOutlined />
                </Button>
            ),
        },
    ];

    if (loading) {
        return <Spin />;
    }

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
