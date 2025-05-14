// src/main.tsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import './i18n'; // Importa la configuración de i18n pero no necesitamos el proveedor aquí

/**
 * Punto de entrada principal de la aplicación React
 * Configura los proveedores de contexto necesarios y renderiza la aplicación
 */

// Asegurándonos de que el contenedor tiene un tipo correcto
const rootElement = document.getElementById('root') as HTMLElement;

// Creamos la raíz de React 18 usando createRoot
const root = createRoot(rootElement);

// Renderizamos la aplicación con los proveedores de contexto
root.render(
  /* StrictMode ayuda a detectar problemas potenciales en el desarrollo */
  <StrictMode>
    {/* Proveedor de tema para manejar el modo claro/oscuro */}
    <ThemeProvider>
      {/* Componente principal de la aplicación */}
      <App />
    </ThemeProvider>
  </StrictMode>
);