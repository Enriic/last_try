import React from 'react'
import { PageContainer } from '@ant-design/pro-layout'
import JunoUploadFile from '../../components/JunoUploadFile/JunoUploadFile'
import { Row, Col } from 'antd';
import './styles/Upload.less'
import { Document, pdfjs } from 'react-pdf';
import PDFViewer from '../../components/PDFViewer/PDFViewer';
//import pdf from '../../assets/mock-data/412KB.pdf'

// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   '../../../node_modules/react-pdf/node_modules/pdfjs-dist/build/pdf.worker.min.js',
//   import.meta.url
// ).toString();

function Upload() {

  const fileUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

  const handleDownload = () => {
    // Lógica para descargar el archivo
    window.open(fileUrl, '_blank');
  };
  return (
    <PageContainer className='page-container'
      header={{
        title: 'Subida de Documentos',
      }}
    >
      <Row gutter={16}>
        {/* Columna izquierda: Componente Upload */}
        <Col span={12} style={{ padding: '1em' }}>
          <JunoUploadFile />
        </Col>

        {/* Columna derecha: Previsualizador */}
        <Col span={12}>
          <div style={{ height: '100vh' }}>
            <PDFViewer fileUrl="{fileUrl}" onDownload={handleDownload} />
            {/* <PDFViewer fileUrl="{fileUrl}" /> */}
          </div>
        </Col>
      </Row>
    </PageContainer>

  )
}

export default Upload