// src/types/index.ts

export interface Validation {
    document_info: Document;
    id: string;
    document: string;
    document_name: string | null;
    user: number;
    status: 'success' | 'failure' ;
    validation_details: ValidationDetail[];
    timestamp: string;
    document_type: string | number; // Agrega este campo si lo tienes
    validation_time: number; // Tiempo en segundos que tomó la validación
}

export interface ValidationDetail {
    name: string;
    result: string;
}

export interface DocumentType {
    id: number;
    name: string;
}

export interface Document {
    id: number;
    name: string;
    document_type: number;
    document_type_name: string | null;
    timestamp: string;
    url: string;
    user: number;
}



// Agrega otros tipos si es necesario