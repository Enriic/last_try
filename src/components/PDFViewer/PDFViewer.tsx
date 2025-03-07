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

/**
 * Componente para visualizar PDFs.
 * @param {PDFViewerProps} props - Propiedades del componente.
 * @returns {JSX.Element} - El componente renderizado.
 */
const PDFViewer: React.FC<PDFViewerProps> = ({ documentId, onDownload, style }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [scale, setScale] = useState(1.0);
    const [rotation, setRotation] = useState(0);
    const [pdfFile, setPdfFile] = useState<any>(null);
    const { t } = useTranslation();
    const { xs, md, lg } = useBreakpoint();
    const isLargeWidth = lg;
    const isMediumWidth = md && !lg;

    /**
     * Ajusta la escala del PDF según el tamaño de la pantalla.
     */
    useEffect(() => {
        isLargeWidth ? setScale(1.0) : isMediumWidth ? setScale(0.75) : setScale(0.5);
    }, [isLargeWidth, isMediumWidth]);

    /**
     * Obtiene el PDF al montar el componente o cuando cambia el documentId.
     */
    useEffect(() => {
        if (documentId) {
            fetchPdf();
        }
    }, [documentId]);

    /**
     * Obtiene el PDF desde el contenedor de blobs.
     */
    const fetchPdf = async () => {
        try {
            const pdfBlob = await getDocumentFromBlobContainer(documentId);
            setPdfFile(pdfBlob);
        } catch (error) {
            console.error('Error al obtener el PDF:', error);
            notification.error({
                message: t('pdf_viewer.doc_load.error.message'),
                description: t('pdf_viewer.doc_load.error.description'),
            });
        }
    };

    /**
     * Se llama cuando se carga el documento PDF correctamente.
     * @param {PDFDocumentProxy} - El proxy del documento PDF.
     */
    const onDocumentLoadSuccess = ({ numPages }: PDFDocumentProxy) => {
        setNumPages(numPages);
    };

    /**
     * Se llama cuando hay un error al cargar el documento PDF.
     * @param {Error} error - El error ocurrido.
     */
    const onDocumentLoadError = (error: Error) => {
        notification.error({
            message: t('pdf_viewer.doc_load.error.message'),
            description: t('pdf_viewer.doc_load.error.description'),
        });
    };

    return (
        <div className="pdf-viewer">
            <Space className="pdf-viewer-toolbar">
                <Button icon={<ZoomOutOutlined />} onClick={() => setScale(scale - 0.25)} disabled={scale <= 0.5} />
                <InputNumber
                    min={0.5}
                    max={4}
                    step={0.25}
                    value={scale}
                    onChange={(value) => {
                        if (value !== null) {
                            const newScale = Math.min(Math.max(value, 0.5), 4);
                            setScale(newScale);
                        } else {
                            setScale(1.0);
                        }
                    }}
                    formatter={(value) => `${Math.round((value ?? 1.0) * 100)}%`}
                    parser={(value) => {
                        const parsed = parseFloat(value?.replace('%', '') || '100') / 100;
                        return isNaN(parsed) ? 1 : parsed;
                    }}
                />
                <Button icon={<ZoomInOutlined />} onClick={() => setScale(scale + 0.25)} disabled={scale >= 4} />
                <Button icon={<RotateLeftOutlined />} onClick={() => setRotation(rotation - 90)} />
                <Button icon={<RotateRightOutlined />} onClick={() => setRotation(rotation + 90)} />
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
                    {Array.from(new Array(numPages || 0), (el, index) => (
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