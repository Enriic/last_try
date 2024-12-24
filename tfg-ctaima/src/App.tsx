import React from 'react';
import { ConfigProvider } from 'antd';
import { useTheme } from './context/ThemeContext';
import { getTheme } from './config/theme';
import './assets/styles/styles.less'; // Revisa la ruta según corresponda
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n'; // Importa tu configuración de i18n
import { AuthProvider } from './auth'; // Importa tu proveedor de autenticación
// Importa tus componentes de página
import DashboardPage from './pages/Dashboard/Dashboard';
import UploadPage from './pages/Upload/Upload';
import { pdfjs } from 'react-pdf';
import BasicLayout from './components/Layout/BasicLayout';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function App() {
  const { isDarkMode } = useTheme();
  const themeConfig = getTheme(isDarkMode);


  return (
    <I18nextProvider i18n={i18n}>
      {/* <AuthProvider> */}
      <ConfigProvider theme={themeConfig}>
        <Router>
          <Routes>
            <Route path="/" element={<BasicLayout />}>
              {/* Rutas anidadas */}
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="upload" element={<UploadPage />} />
              {/* Puedes agregar más rutas aquí */}
            </Route>
          </Routes>
        </Router>
      </ConfigProvider>
      {/* </AuthProvider> */}
    </I18nextProvider>
  );
}

export default App;


