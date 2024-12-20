// src/App.tsx

import React from 'react';
import { Button, ConfigProvider, Input } from 'antd';
import { useTheme } from './context/ThemeContext';
import { getTheme } from './config/theme';
import '../src/assets/styles/styles.less'

function App() {
  const { isDarkMode } = useTheme();
  const themeConfig = getTheme(isDarkMode);

  return (
    <ConfigProvider theme={themeConfig}>
      <div className={isDarkMode ? 'dark' : 'light'}>
        {/* Tu aplicación */}
        <h3>Elementos</h3>
        <Input placeholder="Nombre" style={{width:'160px', margin: '20px', height: '30px'}}/>
        <Button type="primary"> Botón</Button>
      </div>
    </ConfigProvider >
  );
}

export default App;