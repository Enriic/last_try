export interface PDFViewerProps {
    documentId: string;
    onDownload?: (documentId:string) => void;
    style?: React.CSSProperties;
}