// src/components/DashboardItems/DashboardKPIs/DashboardKPIs.tsx

import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { Validation } from '../../../types';
import { calculateKPIs } from '../../../utils/kpiUtils';
import { useTranslation } from 'react-i18next';
import './DashboardKPIs.less';

/**
 * Props para el componente DashboardKPIs
 */
interface DashboardKPIsProps {
    /** Array de validaciones para calcular los KPIs */
    validations: Validation[];
    loading: boolean;
}

/**
 * Componente que muestra los indicadores clave de rendimiento (KPIs) de las validaciones
 * 
 * Presenta estadísticas de validaciones totales, aprobadas, rechazadas y tasa de éxito
 * en un formato de tarjeta visual.
 */
const DashboardKPIs: React.FC<DashboardKPIsProps> = ({ validations, loading }) => {
    const { t } = useTranslation();

    // Calcular KPIs a partir de las validaciones proporcionadas
    const { totalValidations, approved, rejected, successRate } = calculateKPIs(validations);

    return (
        <Row gutter={16} style={{ gap: 16 }}>
            <Col xs={24} sm={12} md={6}>
                {/* Tarjeta contenedora con estado de carga */}
                <Card loading={loading} className='dashboard-kpi-card'>
                    {/* Estadística para el total de validaciones */}
                    <Statistic
                        title={t('dashboardKPIs.totalValidations')}
                        value={totalValidations}
                        className='dashboard-kpi-statistics dashboard-kpi-statistics-total'
                    />

                    {/* Estadística para validaciones aprobadas con color verde */}
                    <Statistic
                        title={t('dashboardKPIs.approved')}
                        value={approved}
                        valueStyle={{ color: '#3f8600' }} // Color verde para indicar éxito
                        className='dashboard-kpi-statistics dashboard-kpi-statistics-approved'
                    />

                    {/* Estadística para la tasa de éxito con formato de porcentaje */}
                    <Statistic
                        className='dashboard-kpi-statistics dashboard-kpi-statistics-success-rate'
                        title={t('dashboardKPIs.successRate')}
                        value={successRate}
                        precision={2} // Mostrar con dos decimales
                        suffix="%" // Añadir símbolo de porcentaje
                    />

                    {/* Estadística para validaciones rechazadas con color rojo */}
                    <Statistic
                        title={t('dashboardKPIs.rejected')}
                        value={rejected}
                        className='dashboard-kpi-statistics dashboard-kpi-statistics-rejected'
                        valueStyle={{ color: '#cf1322' }} // Color rojo para indicar fallo
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default DashboardKPIs;