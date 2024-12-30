// src/pages/Dashboard/DashboardPage.tsx

import React, { useState, useEffect } from 'react';
import { Row, Col, message, Switch, Typography } from 'antd';
import DashboardKPIs from '../../components/DashboardKPIs/DashboardKPIs';
import ValidationBarChart from '../../components/ValidationBarChart/ValidationBarChart';
import ValidationPieChart from '../../components/ValidationPieChart/ValidationPieChart';
import DocumentTypeAnalysis from '../../components/DocumentTypeAnalysis/DocumentTypeAnalysis';
import Filters from '../../components/Filters/Filters';
import { getValidations } from '../../services/validationService';
import { useAuth } from '../../context/AuthContext';
import { Validation } from '../../types';
import './DashboardPage.less'

const { Text } = Typography;

const DashboardPage: React.FC = () => {
  const [validations, setValidations] = useState<Validation[]>([]);
  const [filteredValidations, setFilteredValidations] = useState<Validation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  // Estado para controlar si se muestran todas las validaciones o solo las del usuario
  const [showAllValidations, setShowAllValidations] = useState<boolean>(false);

  useEffect(() => {
    fetchValidations();
  }, [showAllValidations]);

  const fetchValidations = async () => {
    try {
      setLoading(true);
      const data = await getValidations(showAllValidations, user);
      setValidations(data);
      setFilteredValidations(data); // Inicialmente aplicamos los filtros a todas las validaciones obtenidas
    } catch (error) {
      message.error('Error al obtener las validaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filteredData: Validation[]) => {
    setFilteredValidations(filteredData);
  };

  const handleSwitchChange = (checked: boolean) => {
    setShowAllValidations(checked);
  };

  return (
    <div style={{ padding: 24 }}>
      <Row align="middle" justify="space-between" style={{ marginBottom: 16 }}>
        <Col>
          {/* Mostrar el switch solo si el usuario tiene permisos */}
            <div>
              <Switch size="small" checked={showAllValidations} onChange={handleSwitchChange}/>
              <Text style={{ marginLeft: 8 , fontSize: 12}}>
                {showAllValidations ? 'Mostrando todas las validaciones' : 'Mostrando mis validaciones'}
              </Text>
            </div>
          
        </Col>
      </Row>

      <Filters validations={validations} onFilter={handleFilter} />
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <DashboardKPIs validations={filteredValidations} loading={loading} />
        </Col>
        <Col xs={24} lg={12}>
          <ValidationBarChart validations={filteredValidations} />
        </Col>
        <Col xs={24} lg={12}>
          <ValidationPieChart validations={filteredValidations} />
        </Col>
        <Col span={24}>
          <DocumentTypeAnalysis validations={filteredValidations} />
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;