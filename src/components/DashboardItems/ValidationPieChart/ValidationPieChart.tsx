// src/components/DashboardItems/ValidationPieChart/ValidationPieChart.tsx

import React from 'react';
import { Card } from 'antd';
import { Validation } from '../../../types';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer, Label } from 'recharts';
import { calculateValidationDistribution } from '../../../utils/chartUtils';
import './ValidationPieChart.less';
import { useTranslation } from 'react-i18next';

/**
 * Tipo para los posibles estados de validación
 */
type ValidationStatus = 'success' | 'failure';

/**
 * Props para el componente ValidationPieChart
 */
interface ValidationPieChartProps {
    /** Array de validaciones para analizar y mostrar en el gráfico */
    validations: Validation[];
    /** Indica si los datos están cargándose */
    loading?: boolean;
}

/**
 * Componente que muestra un gráfico circular con la distribución de validaciones
 * 
 * Visualiza la proporción entre validaciones exitosas y fallidas en formato de donut chart,
 * con el porcentaje de éxito en el centro.
 */
const ValidationPieChart: React.FC<ValidationPieChartProps> = ({ validations, loading }) => {
    const { t } = useTranslation();

    /**
     * Procesar los datos para obtener la distribución de validaciones por estado
     * El resultado es un array de objetos {status, value} usado por el gráfico
     */
    const data = calculateValidationDistribution(validations);

    /**
     * Calcular la tasa de éxito para mostrarla en el centro del gráfico
     */
    const totalValidations = validations.length;
    const approvedValidations = validations.filter((v) => v.status === 'success').length;
    const successRate = totalValidations > 0 ? (approvedValidations / totalValidations) * 100 : 0;

    /**
     * Colores asignados a cada estado de validación
     * Se usa un registro para mapear fácilmente el estado a su color correspondiente
     */
    const COLORS: Record<ValidationStatus, string> = {
        success: '#7346FF', // Morado para validaciones exitosas
        failure: '#fd424b',  // Rojo para validaciones fallidas
    };

    return (
        <Card
            title={t('validationPieChart.distributionOfResults')}
            className='dashboard-pie-chart'
            style={{ width: 250 }}
            loading={loading}
        >
            {/* Contenedor responsivo para adaptarse al tamaño de la pantalla */}
            <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                    {/* Gráfico circular con forma de donut (radio interno y externo) */}
                    <Pie
                        data={data}
                        dataKey="value" // Propiedad que determina el tamaño de cada sección
                        nameKey="status" // Propiedad que identifica cada sección
                        cx="50%" // Centro horizontal en la mitad del contenedor
                        cy="47%" // Centro vertical ligeramente arriba del medio
                        innerRadius={50} // Radio interior para crear efecto donut
                        outerRadius={70} // Radio exterior del gráfico
                        startAngle={90} // Ángulo inicial (parte superior)
                        endAngle={450} // Ángulo final (vuelta completa + 90)
                    >
                        {/* Mapear cada entrada de datos a una celda con su color correspondiente */}
                        {data.map((entry) => (
                            <Cell key={entry.status} fill={COLORS[entry.status as ValidationStatus]} />
                        ))}
                        {/* Etiqueta central que muestra la tasa de éxito */}
                        <Label
                            value={`${successRate.toFixed(2)}%`} // Formato de porcentaje con 2 decimales
                            position="center" // Posición en el centro del donut
                            style={{ fontSize: '24px', fontWeight: 'bold' }} // Estilo visual destacado
                        />
                    </Pie>
                    {/* Tooltip que aparece al pasar el ratón sobre cada sección */}
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default ValidationPieChart;