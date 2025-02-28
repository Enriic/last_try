// src/components/DashboardKPIs/DashboardKPIs.tsx

import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { Validation } from '../../../types';
import { calculateKPIs } from '../../../utils/kpiUtils';
import { useTranslation } from 'react-i18next'; // Importa el hook de traducción
import './DashboardKPIs.less';

interface DashboardKPIsProps {
    validations: Validation[];
    loading: boolean;
}

const DashboardKPIs: React.FC<DashboardKPIsProps> = ({ validations, loading }) => {
    const { t } = useTranslation(); // Obtiene la función de traducción
    const { totalValidations, approved, rejected, successRate } = calculateKPIs(validations);

    return (
        <Row gutter={16} style={{ gap: 16 }}>
            <Col xs={24} sm={12} md={6}>
                <Card loading={loading} className='dashboard-kpi-card'>
                    <Statistic
                        title={t('dashboardKPIs.totalValidations')}
                        value={totalValidations}
                        className='dashboard-kpi-statistics dashboard-kpi-statistics-total'
                    />
                    <Statistic
                        title={t('dashboardKPIs.approved')}
                        value={approved}
                        valueStyle={{ color: '#3f8600' }}
                        className='dashboard-kpi-statistics dashboard-kpi-statistics-approved'
                    />
                    <Statistic
                        className='dashboard-kpi-statistics dashboard-kpi-statistics-success-rate'
                        title={t('dashboardKPIs.successRate')}
                        value={successRate}
                        precision={2}
                        suffix="%"
                    />
                    <Statistic
                        title={t('dashboardKPIs.rejected')}
                        value={rejected}
                        className='dashboard-kpi-statistics dashboard-kpi-statistics-rejected'
                        valueStyle={{ color: '#cf1322' }}
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default DashboardKPIs;