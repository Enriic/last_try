// src/components/DashboardKPIs/DashboardKPIs.tsx

import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { Validation } from '../../types';
import { calculateKPIs } from '../../utils/kpiUtils';

interface DashboardKPIsProps {
    validations: Validation[];
    loading: boolean;
}

const DashboardKPIs: React.FC<DashboardKPIsProps> = ({ validations, loading }) => {
    const { totalValidations, approved, rejected, successRate, averageValidationTime } = calculateKPIs(validations);

    return (
        <Row gutter={16} style={{gap: 16}}>
            <Col xs={24} sm={12} md={6}>
                <Card loading={loading}>
                    <Statistic title="Total Validaciones" value={totalValidations} />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card loading={loading}>
                    <Statistic title="Aprobadas" value={approved} />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card loading={loading}>
                    <Statistic title="Rechazadas" value={rejected} />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card loading={loading}>
                    <Statistic
                        title="Tasa de Éxito"
                        value={successRate}
                        precision={2}
                        suffix="%"
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card loading={loading}>
                    <Statistic
                        title="Tiempo Promedio (s)"
                        value={averageValidationTime}
                        precision={2}
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default DashboardKPIs;