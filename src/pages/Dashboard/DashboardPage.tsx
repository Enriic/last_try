// src/pages/Dashboard/DashboardPage.tsx

import React, { useState, useEffect } from 'react';
import { Row, Col, notification } from 'antd';
import DashboardKPIs from '../../components/DashboardItems/DashboardKPIs/DashboardKPIs';
import ValidationBarChart from '../../components/DashboardItems/ValidationBarChart/ValidationBarChart';
import ValidationPieChart from '../../components/DashboardItems/ValidationPieChart/ValidationPieChart';
import DocumentTypeAnalysis from '../../components/DashboardItems/DocumentTypeAnalysis/DocumentTypeAnalysis';
import Filters from '../../components/Filters/DashboardFilters/Filters';
import { getAllValidations } from '../../services/validationService';
import { Validation } from '../../types';
import { ValidationFilterOptions } from '../../types/filters';
import { PageContainer } from '@ant-design/pro-layout';
import './DashboardPage.less';
import { useTranslation } from 'react-i18next'; // Importar el hook de traducción

/**
 * Página principal del dashboard con métricas y gráficos de validación
 */
const DashboardPage: React.FC = () => {
  /* Hook para acceder a las funciones de traducción */
  const { t } = useTranslation();
  /* Estado para almacenar las validaciones */
  const [validations, setValidations] = useState<Validation[]>([]);
  /* Estado para los filtros aplicados */
  const [filters, setFilters] = useState<ValidationFilterOptions>({});
  /* Estado para controlar la carga de datos */
  const [loading, setLoading] = useState<boolean>(true);

  /* Efecto para cargar los datos iniciales */
  useEffect(() => {
    fetchData()
  }, []);

  /**
   * Función para obtener los datos de validaciones
   * @param appliedFilters - Filtros a aplicar en la consulta
   */
  const fetchData = async (appliedFilters: ValidationFilterOptions = filters) => {
    try {
      setLoading(true);
      const validationResponse = await getAllValidations(appliedFilters);
      console.log(validationResponse);
      setValidations(validationResponse);
    } catch (error) {
      /* Mostrar notificación de error si falla la obtención de datos */
      notification.error({
        message: t('dashboardPage.fetchErrorMessage'),
        description: t('dashboardPage.fetchErrorDescription'),
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manejador para aplicar filtros
   * @param appliedFilters - Filtros seleccionados por el usuario
   */
  const handleApplyFilters = (appliedFilters: ValidationFilterOptions) => {
    setFilters(appliedFilters);
    fetchData(appliedFilters);
  };

  /**
   * Manejador para limpiar todos los filtros
   */
  const handleClearFilters = () => {
    setFilters({});
    fetchData({});
  };

  return (
    <PageContainer className='page-container' >
      {/* Componente de filtros */}
      <Filters onApplyFilters={handleApplyFilters} onClearFilters={handleClearFilters} />

      {/* Contenedor de las métricas y gráficos */}
      <Row gutter={[16, 16]} className="dashboard-stats-row-container" >
        {/* KPIs principales */}
        <Col xs={24} sm={12} md={12} lg={12} xl={6} style={{ width: '100%' }}>
          <DashboardKPIs validations={validations} loading={loading} />
        </Col>

        {/* Gráfico circular de validaciones */}
        <Col xs={24} sm={12} md={12} lg={12} xl={6} xxl={6} style={{ width: '100%' }}>
          <ValidationPieChart validations={validations} loading={loading} />
        </Col>

        {/* Gráfico de barras de validaciones */}
        <Col xs={24} md={24} lg={24} xl={12} xxl={12} style={{ width: '100%' }}>
          <ValidationBarChart validations={validations} loading={loading} />
        </Col>

        {/* Análisis por tipo de documento */}
        <Col xs={24}>
          <DocumentTypeAnalysis validations={validations} loading={loading} />
        </Col>
      </Row>
    </PageContainer>
  );
};

export default DashboardPage;