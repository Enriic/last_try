// src/components/ValidationPieChart/ValidationPieChart.tsx

import React from 'react';
import { Card } from 'antd';
import { Validation } from '../../../types';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer, Label } from 'recharts';
import { calculateValidationDistribution } from '../../../utils/chartUtils';
import './ValidationPieChart.less';
import { useTranslation } from 'react-i18next';

type ValidationStatus = 'success' | 'failure'; // Asegúrate de que este tipo está definido

interface ValidationPieChartProps {
    validations: Validation[];
}

const ValidationPieChart: React.FC<ValidationPieChartProps> = ({ validations }) => {
    const { t } = useTranslation();

    const data = calculateValidationDistribution(validations);

    const totalValidations = validations.length;
    const approvedValidations = validations.filter((v) => v.status === 'success').length;
    const successRate = totalValidations > 0 ? (approvedValidations / totalValidations) * 100 : 0;

    const COLORS: Record<ValidationStatus, string> = {
        success: '#7346FF', // Morado
        failure: '#fd424b',  // Rojo
    };

    return (
        <Card title={t('validationPieChart.distributionOfResults')} className='dashboard-pie-chart' style={{ width: 250 }}>
            <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="status"
                        cx="50%"
                        cy="47%"
                        innerRadius={50}
                        outerRadius={70}
                        startAngle={90}
                        endAngle={450}
                    >
                        {data.map((entry) => (
                            <Cell key={entry.status} fill={COLORS[entry.status]} />
                        ))}
                        <Label
                            value={`${successRate.toFixed(2)}%`}
                            position="center"
                            style={{ fontSize: '24px', fontWeight: 'bold' }}
                        />
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default ValidationPieChart;