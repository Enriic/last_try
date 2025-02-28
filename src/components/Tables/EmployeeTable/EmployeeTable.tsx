// src/components/EmployeeTable/EmployeeTable.tsx
// 
import React from 'react';
import { Table, Spin, Button } from 'antd';
import { Resource } from '../../../types';
import './EmployeeTable.less';
import { useTranslation } from 'react-i18next';
import { EditOutlined } from '@ant-design/icons';

interface EmployeeTableProps {
    employees: Resource[];
    loading: boolean;
    onViewDetails: (employee: Resource) => void;
    pagination: {
        current: number;
        pageSize: number;
        total: number;
        onChange: (page: number, pageSize?: number) => void;
    };
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
    employees,
    loading,
    pagination,
    onViewDetails,
}) => {
    const { t } = useTranslation();
    console.log('employees', employees);
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

    if (loading) {
        return <Spin />;
    }

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
