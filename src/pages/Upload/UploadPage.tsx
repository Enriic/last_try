// src/pages/Dashboard/Upload.tsx

import { PageContainer } from '@ant-design/pro-layout';
import JunoUploadFile from '../../components/JunoUploadFile/JunoUploadFile';
import { getDocumentFromBlobContainer, getDocument } from '../../services/documentService';
import { Row, Col } from 'antd';
import './Upload.less';
import PDFViewer from '../../components/PDFViewer/PDFViewer';
import { useTranslation } from 'react-i18next'; // Importar el hook de traducción
import { useState } from 'react';

function Upload() {
  const { t } = useTranslation(); // Utilizar el hook de traducción
  const [documentId, setDocumentId] = useState<string>(''); // Inicializar el estado de documentId

  const handleDownload = async () => {
    try {
      const response = await getDocumentFromBlobContainer(documentId);
      const document_name = await getDocument(documentId, 'name');
      
      const pdfBlob = response;
      const fileURL = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', document_name); // Puedes obtener el nombre del archivo del servidor
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(fileURL);
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
    }
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
            <JunoUploadFile documentId={documentId} setDocumentId={setDocumentId}/>
          </Col>

          {/* Right Column: PDF Preview */}
          <Col xs={24} sm={24} md={24} lg={12} className="pdf-preview-container">
            <div style={{ height: '100vh' }}>
              <PDFViewer documentId={documentId} onDownload={handleDownload} />
            </div>
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
}

export default Upload;