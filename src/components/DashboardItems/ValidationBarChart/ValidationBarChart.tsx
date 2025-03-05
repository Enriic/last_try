// src/components/DashboardItems/ValidationBarChart/ValidationBarChart.tsx

import React, { useState } from 'react';
import { Card, Select } from 'antd';
import { Validation } from '../../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { groupValidationsByMonth } from '../../../utils/chartUtils';
import { useTranslation } from 'react-i18next';
import './ValidationBarChart.less';

const { Option } = Select;

/**
 * Año actual para usar como valor por defecto en el selector
 */
const ACTUAL_YEAR = new Date().getFullYear().toString();

/**
 * Props para el componente ValidationBarChart
 */
interface ValidationBarChartProps {
    /** Lista de validaciones para visualizar en el gráfico */
    validations: Validation[];
    loading?: boolean;
}

/**
 * Componente que muestra un gráfico de barras con el número de validaciones por mes
 * 
 * Permite filtrar por año y visualizar la evolución mensual de validaciones
 */
const ValidationBarChart: React.FC<ValidationBarChartProps> = ({ validations, loading }) => {
    /**
     * Estado para el año seleccionado en el filtro
     */
    const [selectedYear, setSelectedYear] = useState(ACTUAL_YEAR);

    // Obtener función de traducción para internacionalización
    const { t } = useTranslation();

    /**
     * Extraer años únicos de los datos de validaciones para poblar el selector
     */
    const years = Array.from(new Set(validations.map(
        (val) => new Date(val.timestamp).getFullYear().toString()
    )));

    /**
     * Filtrar validaciones según el año seleccionado
     */
    const filteredValidations = selectedYear
        ? validations.filter((val) => new Date(val.timestamp).getFullYear().toString() === selectedYear)
        : validations;

    /**
     * Agrupar las validaciones filtradas por mes para visualización en el gráfico
     */
    const data = groupValidationsByMonth(filteredValidations);

    return (
        <Card
            title={t('dashboard.validation_bar_chart.title')}
            className="dashboard-bar-chart"
            loading={loading}
            extra={(
                // Selector de año para filtrar datos
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
            {/* Contenedor responsivo para adaptarse al tamaño de la pantalla */}
            <ResponsiveContainer width="100%" height={160}>
                {/* Gráfico de barras con los datos mensuales */}
                <BarChart data={data} barSize={25} >
                    {/* Rejilla de fondo para mejor lectura de datos */}
                    <CartesianGrid strokeDasharray="3 3" />
                    {/* Eje X con los meses abreviados (primera letra) */}
                    <XAxis
                        dataKey="month"
                        tickFormatter={(month) => month.charAt(0)}
                    />
                    {/* Eje Y con valores enteros (sin decimales) */}
                    <YAxis allowDecimals={false} />
                    {/* Tooltip para mostrar detalles al pasar el ratón */}
                    <Tooltip />
                    {/* Barras para representar el número de validaciones */}
                    <Bar
                        dataKey="validations"
                        fill="#7346FF" // Color morado corporativo
                        radius={[8, 8, 0, 0]} // Bordes redondeados en la parte superior
                    />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default ValidationBarChart;