import React from 'react';
import { ConfigProvider } from 'antd';
import es_ES from 'antd/es/locale/es_ES';
import { useTheme } from './context/ThemeContext';
import { getTheme } from './config/theme';
import './assets/styles/styles.less'; // Revisa la ruta según corresponda
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n'; // Importa tu configuración de i18n
import { AuthProvider, useAuth } from './context/AuthContext'; // Importa tu proveedor de autenticación
// Importa tus componentes de página
import DashboardPage from './pages/Dashboard/DashboardPage';
import CompaniesTablePage from './pages/Companies/CompaniesTablePage/CompaniesTablePage';
import UploadPage from './pages/Upload/UploadPage';
import NewEmployeePage from './pages/Resources/NewEmployeePage/NewEmployeePage';
import NewCompanyPage from './pages/Companies/NewCompanyPage/NewCompanyPage';
import ResourcesPage from './pages/Resources/ResourcesPage';
import { pdfjs } from 'react-pdf';
import './assets/styles/styles.less';
import BasicLayout from './components/Layout/BasicLayout';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import EmployeesPage from './pages/Resources/EmployeesPage/EmployeesPage';
import LoginPage from './pages/Login/LoginPage';
import ValidationHistoryPage from './pages/ValidationHistory/ValidationHistoryPage';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
import { App as AntdApp } from 'antd'; // Importa el componente App de Ant Design


function App() {
  const { isDarkMode } = useTheme();
  const themeConfig = getTheme(isDarkMode);

  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <ConfigProvider theme={themeConfig} locale={es_ES}>
          <AntdApp> {/* Añade este contenedor */}
            <Router>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<PrivateRoute />}>
                  <Route path="/" element={<BasicLayout />}>
                    <Route path="upload" element={<UploadPage />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="history" element={<ValidationHistoryPage />} />
                    {/* <Route path="resources" element={<ResourcesPage />} /> */}
                    <Route path="companies" element={<CompaniesTablePage/>} />
                    <Route path="companies/new" element={<NewCompanyPage />} />
                    <Route path="resources/employees" element={<EmployeesPage />} />
                    <Route path="resources/employees/new" element={<NewEmployeePage />} />
                  </Route>
                </Route>
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Router>
          </AntdApp> {/* Cierra el contenedor */}
        </ConfigProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;


