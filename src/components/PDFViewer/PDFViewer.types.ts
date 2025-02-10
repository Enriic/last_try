export interface PDFViewerProps {
    documentId: string;
    onDownload?: () => void;
    style?: React.CSSProperties;
}