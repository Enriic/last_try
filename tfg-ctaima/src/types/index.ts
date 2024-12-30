// src/types/index.ts

export interface Validation {
    id: string;
    document: string;
    user: number;
    status: 'success' | 'failure' ;
    validation_details: ValidationDetail[];
    timestamp: string;
    document_type: string; // Agrega este campo si lo tienes
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



// Agrega otros tipos si es necesario