// src/pages/Dashboard/DashboardPage.tsx

import React, { useState, useEffect } from 'react';
import { Row, Col, notification } from 'antd';
import DashboardKPIs from '../../components/DashboardKPIs/DashboardKPIs';
import ValidationBarChart from '../../components/ValidationBarChart/ValidationBarChart';
import ValidationPieChart from '../../components/ValidationPieChart/ValidationPieChart';
import DocumentTypeAnalysis from '../../components/DocumentTypeAnalysis/DocumentTypeAnalysis';
import Filters from '../../components/Filters/DashboardFilters/Filters';
import { getAllValidations } from '../../services/validationService';
import { Validation } from '../../types';
import { ValidationFilterOptions } from '../../types/filters';
import { PageContainer } from '@ant-design/pro-layout';
import './DashboardPage.less';
import { useTranslation } from 'react-i18next'; // Importar el hook de traducción

const DashboardPage: React.FC = () => {
  const { t } = useTranslation(); // Utilizar el hook de traducción
  const [validations, setValidations] = useState<Validation[]>([]);
  const [filters, setFilters] = useState<ValidationFilterOptions>({}); // Nuevo estado para filtros
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchData()
  }, []);

  const fetchData = async (appliedFilters: ValidationFilterOptions = filters) => {
    try {
      setLoading(true);
      const validationResponse = await getAllValidations(appliedFilters);
      console.log(validationResponse);
      setValidations(validationResponse);
    } catch (error) {
      notification.error({
        message: t('dashboardPage.fetchErrorMessage'), // Usar traducción para el mensaje
        description: t('dashboardPage.fetchErrorDescription'), // Usar traducción para la descripción
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (appliedFilters: ValidationFilterOptions) => {
    setFilters(appliedFilters);
    fetchData(appliedFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    fetchData({});
  };

  return (
    <PageContainer className='page-container' >
      <Filters onApplyFilters={handleApplyFilters} onClearFilters={handleClearFilters} />
      <Row gutter={[16, 16]} className="dashboard-stats-row-container" >
        <Col xs={24} sm={12} md={12} lg={12} xl={6} style={{ width: '100%' }}>
          <DashboardKPIs validations={validations} loading={loading} />
        </Col>
        <Col xs={24} sm={12} md={12} lg={12} xl={6} xxl={6} style={{ width: '100%' }}>
          <ValidationPieChart validations={validations} />
        </Col>
        <Col xs={24} md={24} lg={24} xl={12} xxl={12} style={{ width: '100%' }}>
          <ValidationBarChart validations={validations} />
        </Col>
        <Col xs={24}>
          <DocumentTypeAnalysis validations={validations} />
        </Col>
      </Row>
    </PageContainer>
  );
};

export default DashboardPage;