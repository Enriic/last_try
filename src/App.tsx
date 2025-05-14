// src/App.tsx

import { ConfigProvider } from 'antd';
import es_ES from 'antd/es/locale/es_ES';
import { useTheme } from './context/ThemeContext';
import { getTheme } from './config/theme';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n'; // Configuración de internacionalización
import { AuthProvider } from './context/AuthContext'; // Proveedor de autenticación
import { App as AntdApp } from 'antd'; // Componente App de Ant Design para notifications, modals, etc.
import { pdfjs } from 'react-pdf';

// Importaciones de páginas y componentes
import DashboardPage from './pages/Dashboard/DashboardPage';
import CompaniesTablePage from './pages/Companies/CompaniesTablePage/CompaniesTablePage';
import UploadPage from './pages/Upload/UploadPage';
import NewEmployeePage from './pages/Resources/NewEmployeePage/NewEmployeePage';
import NewCompanyPage from './pages/Companies/NewCompanyPage/NewCompanyPage';
import BasicLayout from './components/Layout/BasicLayout';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import EmployeesPage from './pages/Resources/EmployeesPage/EmployeesPage';
import LoginPage from './pages/Login/LoginPage';
import ValidationHistoryPage from './pages/ValidationHistory/ValidationHistoryPage';

// Importación de estilos globales
import './assets/styles/styles.less';

// Configuración del worker para la librería PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

/**
 * Componente principal de la aplicación
 * Configura el tema, la internacionalización, la autenticación y el enrutamiento
 */
function App() {
  /* Obtener el modo de tema actual (claro/oscuro) */
  const { isDarkMode } = useTheme();
  /* Generar la configuración de tema basada en el modo */
  const themeConfig = getTheme(isDarkMode);

  return (
    /* Proveedor de internacionalización */
    <I18nextProvider i18n={i18n}>
      {/* Proveedor de autenticación */}
      <AuthProvider>
        {/* Proveedor de configuración de tema para Ant Design */}
        <ConfigProvider theme={themeConfig} locale={es_ES}>
          {/* Contenedor de la App de Ant Design para notificaciones y modales */}
          <AntdApp>
            {/* Router principal de la aplicación */}
            <Router>
              <Routes>
                {/* Ruta pública para el login */}
                <Route path="/login" element={<LoginPage />} />

                {/* Rutas protegidas que requieren autenticación */}
                <Route element={<PrivateRoute />}>
                  {/* Layout básico que se aplica a todas las rutas privadas */}
                  <Route path="/" element={<BasicLayout />}>
                    {/* Rutas específicas para cada funcionalidad */}
                    <Route path="upload" element={<UploadPage />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="history" element={<ValidationHistoryPage />} />
                    <Route path="companies" element={<CompaniesTablePage />} />
                    <Route path="companies/new" element={<NewCompanyPage />} />
                    <Route path="resources/employees" element={<EmployeesPage />} />
                    <Route path="resources/employees/new" element={<NewEmployeePage />} />
                  </Route>
                </Route>

                {/* Redirección para rutas no encontradas */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Router>
          </AntdApp>
        </ConfigProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;