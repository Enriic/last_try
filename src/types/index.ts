// // src/types/index.ts

export enum ValidationStatus {
    SUCCESS = 'success',
    FAILURE = 'failure',
}

export enum ResourceType {
    VEHICLE = 'vehicle',
    EMPLOYEE = 'employee',
}

export interface Validation {
    id: string;
    document: string;
    document_type: number;
    document_name: string;
    document_type_name: string;
    user: number;
    status: ValidationStatus; // Usando enum
    validation_details: ValidationResult;
    timestamp: string;
    resource_id: string;
    company: string;
    validation_time: number; // Tiempo en segundos que tomó la validación
}

export interface ValidationResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Validation[];
}


export interface CompanyResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Company[];
}

export interface ResourceResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Resource[];
}

export interface ValidationDetail {
    name: string;
    fields_to_validate: FieldToValidate[]
    fields_to_extract: FieldToExtract[]
    result: string; // Podría ser un enum ('match' | 'mismatch' | 'not_provided')
}

export interface ValidationRequest {
    fields_to_validate: FieldToValidate[] | undefined;
    fields_to_extract: FieldToExtract[] | undefined;
}

export interface ValidationResult {
    fields_to_validate: ValidationResultField[];
    fields_to_extract: FieldToExtract[];
}

export interface ValidationResultField extends FieldToValidate{
    obtained_value: string;
}

export interface FieldToValidate {
    id: number;
    name: string;
    description: string;
    expected_value: string | number | boolean;
}

export interface FieldToExtract {
    id: number;
    name: string;
    description: string;
    obtained_value: string | number | boolean;
}

export interface DocumentType {
    id: number;
    name: string; // Nombre del tipo de documento
    description: string; // Descripción del documento
    user: number; // ID del usuario relacionado con el documento
    associated_entity: string; // tipo de entidad asociada (resource | company)
    fields_to_validate: FieldToValidate[]; // Campos asociados con el documento
    fields_to_extract: FieldToExtract[]; // Campos a extraer del documento
}

export interface Document {
    id: string;
    name: string;
    document_type: number | null; // ID del tipo de documento
    company: string ;
    resource: string; // ID del recurso asociado
    timestamp: string;
    url: string; // URL para acceder al documento
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
    id: string;
    company_id: string; // Equivalente al tax_id en twind
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
    resource_type: ResourceType; // Usando enum para tipos de recursos
    company: string; // ID de la compañía
    timestamp: string;
    resource_details: VehicleDetails | EmployeeDetails; // Detalles específicos del recurso
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
    worker_id: string; // Número de identificación (DNI, Pasaporte, etc.) del empleado
    // Otros campos específicos del empleado
}

