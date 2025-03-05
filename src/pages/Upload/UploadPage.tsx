// src/pages/Upload/UploadPage.tsx

import { PageContainer } from '@ant-design/pro-layout';
import JunoUploadFile from '../../components/JunoUploadFile/JunoUploadFile';
import { getDocumentFromBlobContainer, getDocument } from '../../services/documentService';
import { Row, Col } from 'antd';
import './Upload.less';
import PDFViewer from '../../components/PDFViewer/PDFViewer';
import { useTranslation } from 'react-i18next'; // Importar el hook de traducción
import { useState } from 'react';

/**
 * Componente para la página de carga de documentos
 */
function Upload() {
  /* Hook para acceder a las funciones de traducción */
  const { t } = useTranslation();
  /* Estado para almacenar el ID del documento actual */
  const [documentId, setDocumentId] = useState<string>('');

  /**
   * Función para manejar la descarga del documento
   */
  const handleDownload = async () => {
    try {
      /* Obtiene el contenido del documento del contenedor de blobs */
      const response = await getDocumentFromBlobContainer(documentId);
      /* Obtiene el nombre del documento */
      const document_name = await getDocument(documentId, 'name');

      /* Crea un blob con el contenido PDF */
      const pdfBlob = response;
      /* Crea una URL para el blob */
      const fileURL = URL.createObjectURL(pdfBlob);
      /* Crea un elemento anchor para la descarga */
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', document_name);
      /* Añade el link al DOM, hace clic en él y lo remueve después */
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      /* Libera la URL del objeto para liberar memoria */
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
      <div className="upload-page-content" style={{ padding: '2em', backgroundColor: 'white', borderRadius: 16 }}>
        <Row gutter={16}>
          {/* Columna izquierda: Componente de carga */}
          <Col
            xs={24}
            md={11}
            style={{ padding: '1em' }}
            className="upload-container"
          >
            <JunoUploadFile documentId={documentId} setDocumentId={setDocumentId} />
          </Col>

          {/* Columna derecha: Vista previa del PDF */}
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