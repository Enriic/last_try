// src/components/ValidationBarChart/ValidationBarChart.tsx

import React from 'react';
import { Card } from 'antd';
import { Validation } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { groupValidationsByMonth } from '../../utils/chartUtils';
import './ValidationBarChart.less';

interface ValidationBarChartProps {
    validations: Validation[];
}

const ValidationBarChart: React.FC<ValidationBarChartProps> = ({ validations }) => {
    const data = groupValidationsByMonth(validations);

    return (
        <Card title="Validaciones por Mes" className='dashboard-bar-chart'>
            <ResponsiveContainer width="100%" height={160}>
                <BarChart data={data} barSize={25}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="month"
                        tickFormatter={(month) => month.charAt(0)}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="validations" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default ValidationBarChart;