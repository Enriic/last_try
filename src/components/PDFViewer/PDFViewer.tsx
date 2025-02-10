import React, { useState, useEffect } from 'react';
import { Button, Space, Spin, Typography, InputNumber, notification } from 'antd';
import {
    ZoomOutOutlined,
    ZoomInOutlined,
    RotateLeftOutlined,
    RotateRightOutlined,
    DownloadOutlined
} from '@ant-design/icons';
import { Document, Page } from 'react-pdf';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import './PDFViewer.less';
import { type PDFDocumentProxy } from "pdfjs-dist";
import { getDocumentFromBlobContainer } from '../../services/documentService';
import { useTranslation } from 'react-i18next';
import { PDFViewerProps } from './PDFViewer.types';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const PDFViewer: React.FC<PDFViewerProps> = ({ documentId, onDownload, style }) => {
    // const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [scale, setScale] = useState(1.0);
    const [rotation, setRotation] = useState(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [pdfFile, setPdfFile] = useState<any>(null);  // Aquí almacenaremos el PDF obtenido
    const { t, i18n } = useTranslation();
    const { xs, md, lg } = useBreakpoint();
    const isLargeWidth = lg;
    const isMediumWidth = md && !lg;

    useEffect(() => {
        // Ajustar la escala según el tamaño de la pantalla
        if (isLargeWidth) setScale(1.0);
        else if (isMediumWidth) setScale(0.75);
        else setScale(0.5);
    }, [isLargeWidth, isMediumWidth]);


    useEffect(() => {
        if (documentId) {
            fetchPdf();
        }
    }, [documentId]);

    const fetchPdf = async () => {
        try {
            const pdfBlob = await getDocumentFromBlobContainer(documentId);
            setPdfFile(pdfBlob);
        } catch (error) {
            console.error('Error al obtener el PDF:', error);
        }
    }


    const onDocumentLoadSuccess = ({ numPages }: PDFDocumentProxy) => {
        setNumPages(numPages);
    };

    const onDocumentLoadError = (error: Error) => {
        notification.error({
            message: t('pdf_viewer.doc_load.error.message'),
            description: t('pdf_viewer.doc_load.error.description'),
        });
    };


    return (
        <div className="pdf-viewer">
            <Space className="pdf-viewer-toolbar">
                <Button
                    icon={<ZoomOutOutlined />}
                    onClick={() => setScale(scale - 0.25)}
                    disabled={scale <= 0.5}
                />
                <InputNumber
                    min={0.5}
                    max={4}
                    step={0.25}
                    value={scale}
                    onChange={(value) => setScale(value ?? 1.0)}
                    formatter={(value) => `${Math.round((value ?? 1.0) * 100)}%`}
                />
                <Button
                    icon={<ZoomInOutlined />}
                    onClick={() => setScale(scale + 0.25)}
                    disabled={scale >= 4}
                />
                <Button
                    icon={<RotateLeftOutlined />}
                    onClick={() => setRotation(rotation - 90)}
                />
                <Button
                    icon={<RotateRightOutlined />}
                    onClick={() => setRotation(rotation + 90)}
                />
                <Button icon={<DownloadOutlined />} onClick={onDownload} />
            </Space>
            <div className="pdf-viewer-content" style={style}>
                <Document
                    file={pdfFile}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={<Spin />}
                    noData={<Typography.Text>{t('pdf_viewer.document.no_data')}</Typography.Text>}
                >
                    {Array.from(new Array(numPages), (el, index) => (
                        <Page
                            key={`page_${index + 1}`}
                            pageNumber={index + 1}
                            scale={scale}
                            rotate={rotation}
                            loading={<Spin />}
                        />
                    ))}
                </Document>
            </div>
        </div>
    );
};


export default PDFViewer;
