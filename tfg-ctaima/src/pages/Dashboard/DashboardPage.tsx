// //src/pages/Dashboard/DashboardPage.tsx


import React, { useState, useEffect } from 'react';
import { Row, Col, notification } from 'antd';
import DashboardKPIs from '../../components/DashboardKPIs/DashboardKPIs';
import ValidationBarChart from '../../components/ValidationBarChart/ValidationBarChart';
import ValidationPieChart from '../../components/ValidationPieChart/ValidationPieChart';
import DocumentTypeAnalysis from '../../components/DocumentTypeAnalysis/DocumentTypeAnalysis';
import Filters from '../../components/Filters/DashboardFilters/Filters';
import { getAllValidations } from '../../services/validationService';
import { Validation, ValidationFilterOptions } from '../../types';
import './DashboardPage.less';


const DashboardPage: React.FC = () => {
  const [validations, setValidations] = useState<Validation[]>([]);
  const [filters, setFilters] = useState<ValidationFilterOptions>({}); // New state for filters
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
        message: 'Upps! Something went wrong',
        description: 'An error occurred while fetching the validations',
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
    <div style={{ padding: 24 }}>
      <Row
        className="dashboard-filter-section"
        align="middle"
        justify="space-between"
        style={{ marginBottom: 16 }}
      >
        
        <Col span={18} style={{ marginTop: 16 }}>
          <Filters
            validations={validations}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters} />
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="dashboard-stats-row-container">
        <Col xs={24} md={24} lg={24} xl={12} xxl={12}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={12} md={8} xl={12} xxl={8}>
              <DashboardKPIs validations={validations} loading={loading} />
            </Col>
            <Col xs={24} sm={12} lg={12} md={8} xl={12} xxl={8}>
              <ValidationPieChart validations={validations} />
            </Col>
          </Row>
        </Col>
        <Col xs={24} md={24} lg={24} xl={12} xxl={12}>
          <ValidationBarChart validations={validations} />
        </Col>
        <Col xs={24}>
          <DocumentTypeAnalysis validations={validations} />
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;

