import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import JunoUploadFile from '../../components/JunoUploadFile/JunoUploadFile';
import { Row, Col } from 'antd';
import './Upload.less';
import PDFViewer from '../../components/PDFViewer/PDFViewer';

function Upload() {
  const fileUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

  const handleDownload = () => {
    // Logic to download the file
    window.open(fileUrl, '_blank');
  };

  return (
    <PageContainer
      className="page-container"
      header={{
        title: 'Subida de Documentos',
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