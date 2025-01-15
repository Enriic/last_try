// src/types/index.ts

export interface Validation {
    document_info: Document;
    id: string;
    document: string;
    document_name: string | null;
    user: number;
    status: 'success' | 'failure';
    validation_details: ValidationDetail[];
    timestamp: string;
    document_type: number | null; // Agrega este campo si lo tienes
    validation_time: number; // Tiempo en segundos que tomó la validación
}

export interface ValidationDetail {
    name: string;
    result: string;
}

export interface Field {
    name: string; // Nombre del campo
    description?: string; // Descripción del campo
    value?: string | number | boolean // Tipo del campo, puedes agregar más valores según los tipos permitidos
}

export interface DocumentType {
    id: number;
    name: string; // Nombre del tipo de documento
    description: string; // Descripción del documento
    user: number; // ID del usuario relacionado con el documento
    fields: Field[]; // Array de campos asociados con el documento
}

export interface Document {
    id: string;
    name: string;
    document_type_info: DocumentType;
    document_type_name: string | null;
    timestamp: string;
    url: string;
    user: number;
}

export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name?: string;
    is_active?: boolean;
    is_superuser: boolean;
    is_staff: boolean;
    timestamp?: string;
}

export interface Company {
    id: number;
    tax_id: string;
    company_name: string;
    industry: string;
    email: string;
    phone: string;
    location: string;
    language: string;
    timestamp: string;
}


export interface Resource {
    id: string;
    resource_type: string; // 'vehicle' o 'employee'
    company: string; // ID de la compañía
    company_info: Company;
    timestamp: string;
    resource_details: VehicleDetails | EmployeeDetails;
}

export interface VehicleDetails {
    name: string;
    manufacturer: string;
    registration_id: string;
    model: string;
    weight: number;
    // Otros campos específicos del vehículo
}

export interface EmployeeDetails {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    country: string;
    number_id: string;
    // Otros campos específicos del empleado
}
// Agrega otros tipos si es necesario