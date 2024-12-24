import React, { useState, useEffect } from 'react';
import { Button, Space, Spin, Typography, InputNumber, notification } from 'antd';
import {
    ZoomOutOutlined,
    ZoomInOutlined,
    RotateLeftOutlined,
    RotateRightOutlined,
    DownloadOutlined,
    FilePdfOutlined,
    FullscreenOutlined,
} from '@ant-design/icons';
import { Document, Page } from 'react-pdf';
//import { SizeType } from 'antd/lib/config-provider/SizeContext';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import './styles/PDFViewer.less';
import type { PDFDocumentProxy } from "pdfjs-dist";
// Importa los tipos si utilizas TypeScript
import { PDFViewerProps } from './PDFViewer.types';
import pdf from '../../assets/mock-data/pdf-files/pdf-test.pdf'


const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, onDownload }) => {
    // const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [scale, setScale] = useState(1.0);
    const [rotation, setRotation] = useState(0);

    const { xs, md, lg } = useBreakpoint();
    const isLargeWidth = lg;
    const isMediumWidth = md && !lg;

    useEffect(() => {
        // Ajustar la escala según el tamaño de la pantalla
        if (isLargeWidth) setScale(1.0);
        else if (isMediumWidth) setScale(0.75);
        else setScale(0.5);
    }, [isLargeWidth, isMediumWidth]);

    const onDocumentLoadSuccess = ({ numPages }: PDFDocumentProxy) => {
        setNumPages(numPages);
    };

    const onDocumentLoadError = (error: Error) => {
        notification.error({
            message: 'Error al cargar el documento PDF',
            description: 'Por favor, verifica que el archivo es un PDF válido.',
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
            <div className="pdf-viewer-content">
                <Document
                    file={pdf}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={<Spin />}
                    noData={<Typography.Text>No se encontró ningún documento</Typography.Text>}
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
