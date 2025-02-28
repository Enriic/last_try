import React, { useState } from 'react';
import { Card, Select } from 'antd';
import { Validation } from '../../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { groupValidationsByMonth } from '../../../utils/chartUtils';
import { useTranslation } from 'react-i18next';
import './ValidationBarChart.less';

const { Option } = Select;

const ACTUAL_YEAR = new Date().getFullYear().toString();

interface ValidationBarChartProps {
    validations: Validation[];
}

const ValidationBarChart: React.FC<ValidationBarChartProps> = ({ validations }) => {
    const [selectedYear, setSelectedYear] = useState(ACTUAL_YEAR);

    const { t } = useTranslation();

    // Extract years from the validations data
    const years = Array.from(new Set(validations.map((val) => new Date(val.timestamp).getFullYear().toString())));

    // Filter validations based on the selected year
    const filteredValidations = selectedYear
        ? validations.filter((val) => new Date(val.timestamp).getFullYear().toString() === selectedYear)
        : validations;

    // Group the filtered validations by month
    const data = groupValidationsByMonth(filteredValidations);

    return (
        <Card
            title={t('dashboard.validation_bar_chart.title')}
            className="dashboard-bar-chart"
            extra={(
                <Select
                    placeholder={t('dashboard.validation_bar_chart.select_placeholder')}
                    value={selectedYear}
                    defaultValue={ACTUAL_YEAR}
                    onChange={(year) => setSelectedYear(year)}
                    style={{ width: 200 }}
                >
                    {years.map((year) => (
                        <Option key={year} value={year}>
                            {year}
                        </Option>
                    ))}
                </Select>
            )}
        >
            {/* Bar Chart */}
            <ResponsiveContainer width="100%" height={160}>
                <BarChart data={data} barSize={25} >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="month"
                        tickFormatter={(month) => month.charAt(0)}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="validations" fill="#7346FF" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default ValidationBarChart;
