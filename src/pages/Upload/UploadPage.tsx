// src/pages/Dashboard/Upload.tsx

import { PageContainer } from '@ant-design/pro-layout';
import JunoUploadFile from '../../components/JunoUploadFile/JunoUploadFile';
import { Row, Col } from 'antd';
import './Upload.less';
import PDFViewer from '../../components/PDFViewer/PDFViewer';
import { useTranslation } from 'react-i18next'; // Importar el hook de traducción

function Upload() {
  const { t } = useTranslation(); // Utilizar el hook de traducción

  const fileUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

  const handleDownload = () => {
    window.open(fileUrl, '_blank');
    // Si deseas mostrar un mensaje de descarga, podrías usar una notificación traducida aquí
    // Por ejemplo:
    // notification.success({
    //   message: t('uploadPage.download'),
    //   description: t('uploadPage.downloadSuccess'),
    // });
  };

  return (
    <PageContainer
      className="page-container"
      header={{
        title: t('uploadPage.title'), // Usar traducción para el título
      }}
    >
      <div className="upload-page-content">
        <Row gutter={16}>
          {/* Left Column: Upload Component */}
          <Col
            xs={24}
            md={11}
            style={{ padding: '1em' }}
            className="upload-container"
          >
            <JunoUploadFile />
          </Col>

          {/* Right Column: PDF Preview */}
          <Col xs={24} sm={24} md={24} lg={12} className="pdf-preview-container">
            <div style={{ height: '100vh' }}>
              <PDFViewer fileUrl={fileUrl} onDownload={handleDownload} />
            </div>
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
}

export default Upload;