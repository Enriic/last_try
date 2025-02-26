// src/components/ValidationTable/ValidationTableHistory.tsx

import React from 'react';
import { Table, Button, Spin, Tag } from 'antd';
import { Validation } from '../../types';
import './ValidationTableHistory.less';
import { useTranslation } from 'react-i18next';

interface ValidationTableHistoryProps {
    validations: Validation[];
    loading: boolean;
    onViewDetails: (validation: Validation) => void;
    pagination: {
        current: number;
        pageSize: number;
        total: number;
        onChange: (page: number, pageSize?: number) => void;
    };
}

const ValidationTableHistory: React.FC<ValidationTableHistoryProps> = ({
    validations,
    loading,
    onViewDetails,
    pagination,
}) => {
    const { t } = useTranslation();

    const renderTag = (status: string) => {
        if (status === 'success') {
            return <Tag color="green">{t('validationTableHistory.success')}</Tag>;
        } else if (status === 'failure') {
            return <Tag color="red">{t('validationTableHistory.failure')}</Tag>;
        } else {
            return <Tag>{status.toLocaleUpperCase()}</Tag>;
        }
    };

    const columns = [
        {
            title: t('validationTableHistory.date'),
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (text: string) => new Date(text).toLocaleDateString(),
        },
        {
            title: t('validationTableHistory.documentName'),
            dataIndex: 'document_name',
            key: 'document_name',
            render: (documentName: string) => documentName,
        },
        {
            title: t('validationTableHistory.documentType'),
            dataIndex: 'document_type_name',
            key: 'document_type_name',
            render: (documentTypeName: string) => documentTypeName,
        },
        {
            title: t('validationTableHistory.result'),
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => renderTag(status),
        },
        {
            title: t('validationTableHistory.actions'),
            key: 'actions',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render: (_: any, record: Validation) => (
                <Button type="link" onClick={() => onViewDetails(record)}>
                    {t('validationTableHistory.viewDetails')}
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
            dataSource={validations}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={pagination}
        />
    );
};

export default ValidationTableHistory;