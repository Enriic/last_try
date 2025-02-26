// src/components/ValidationTable/company_table.tsx

import React from 'react';
import { Table, Spin, Button } from 'antd';
import { Company } from '../../types';
import './CompanyTable.less';
import { useTranslation } from 'react-i18next';
import { EditOutlined } from '@ant-design/icons';

interface CompanyTableProps {
    companies: Company[];
    loading: boolean;
    onViewDetails: (company: Company) => void;
    pagination: {
        current: number;
        pageSize: number;
        total: number;
        onChange: (page: number, pageSize?: number) => void;
    };
}

const CompanyTable: React.FC<CompanyTableProps> = ({
    companies,
    loading,
    pagination,
    onViewDetails,
}) => {
    const { t } = useTranslation();

    const columns = [
        {
            title: t('company_table.date'),
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (text: string) => new Date(text).toLocaleDateString(),
        },
        {
            title: t('company_table.company_name'),
            dataIndex: 'company_name',
            key: 'company_name',
            render: (company_name: string) => company_name,
        },
        {
            title: t('company_table.company_id'),
            dataIndex: 'company_id',
            key: 'company_id',
            render: (company_id: string) => company_id,
        },
        {
            title: t('company_table.industry'),
            dataIndex: 'industry',
            key: 'industry',
            render: (industry: string) => industry,
        },
        {
            key: 'actions',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render: (_: any, record: Company) => (
                <Button type="link" onClick={() => onViewDetails(record)}>
                    <EditOutlined />
                </Button>
            ),
        },
        //we'll have an edit action with popup 
    ];

    if (loading) {
        return <Spin />;
    }

    return (
        <Table
            size="middle"
            className="history-validation-table"
            dataSource={companies}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={pagination}
        />
    );
};

export default CompanyTable;