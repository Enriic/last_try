// src/components/Upload/types.ts

export type DocumentType = 'invoice' | 'receipt' | 'report';

export interface DocumentOption {
    value: DocumentType;
    label: string;
}

export interface ValidationField {
    value: string;
    label: string;
}

export interface ValidationFieldsMap {
    [key: string]: ValidationField[];
}