// // src/types/index.ts

// export interface Validation {
//     id: string;
//     document: string;
//     document_info: Document;
//     user: number;
//     status: 'success' | 'failure';
//     validation_details: ValidationDetail[];
//     timestamp: string;
//     document_type: number | null; // Agrega este campo si lo tienes
//     validation_time: number; // Tiempo en segundos que tomó la validación
// }

// export interface ValidationDetail {
//     name: string;
//     expected_value?: string;
//     obtained_value?: string;
//     result: string;
// }

// export interface Field {
//     name: string; // Nombre del campo
//     description?: string; // Descripción del campo
//     value?: string | number | boolean // Tipo del campo, puedes agregar más valores según los tipos permitidos
// }

// export interface DocumentType {
//     id: number;
//     name: string; // Nombre del tipo de documento
//     description: string; // Descripción del documento
//     user: number; // ID del usuario relacionado con el documento
//     fields: Field[]; // Array de campos asociados con el documento
// }

// export interface Document {
//     id: string;
//     name: string;
//     document_type_info: DocumentType;
//     document_type_name: string | null;
//     resource: string;
//     resource_info: Resource;
//     timestamp: string;
//     url: string;
//     user: number;
// }

// export interface User {
//     id: number;
//     username: string;
//     email: string;
//     first_name: string;
//     last_name?: string;
//     is_active?: boolean;
//     is_superuser: boolean;
//     is_staff: boolean;
//     timestamp?: string;
// }

// export interface Company {
//     id: string;
//     tax_id: string;
//     company_name: string;
//     industry: string;
//     email: string;
//     phone: string;
//     location: string;
//     language: string;
//     timestamp: string;
// }

// export interface Resource {
//     id: string;
//     resource_type: string; // 'vehicle' o 'employee'
//     company: string; // ID de la compañía
//     company_info: Company;
//     timestamp: string;
//     resource_details: VehicleDetails | EmployeeDetails;
// }

// export interface VehicleDetails {
//     name: string;
//     manufacturer: string;
//     registration_id: string;
//     model: string;
//     weight: number;
//     // Otros campos específicos del vehículo
// }

// export interface EmployeeDetails {
//     first_name: string;
//     last_name: string;
//     email: string;
//     phone: string;
//     country: string;
//     worker_id: string;
//     // Otros campos específicos del empleado
// }
// // Agrega otros tipos si es necesario


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
    document_info: Document;
    user: number;
    status: ValidationStatus; // Usando enum
    validation_details: ValidationResult;
    timestamp: string;
    document_type: number | null; // ID del tipo de documento asociado
    validation_time: number; // Tiempo en segundos que tomó la validación
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
    value: string | number | boolean;
}

export interface FieldToExtract {
    id: number;
    name: string;
    description: string;
    value: string | number | boolean;
}

export interface DocumentType {
    id: number;
    name: string; // Nombre del tipo de documento
    description: string; // Descripción del documento
    user: number; // ID del usuario relacionado con el documento
    fields_to_validate: FieldToValidate[]; // Campos asociados con el documento
    fields_to_extract: FieldToExtract[]; // Campos a extraer del documento
}

export interface Document {
    id: string;
    name: string;
    document_type_info: DocumentType; // Información del tipo de documento
    document_type_name: string | null; // Nombre opcional del tipo de documento
    resource: string; // ID del recurso asociado
    resource_info: Resource; // Información completa del recurso
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
    company_id: string; // Identificación fiscal
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
    company_info: Company; // Información completa de la compañía
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
    worker_id: string; // Número de identificación
    // Otros campos específicos del empleado
}
