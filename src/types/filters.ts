export interface ValidationFilterOptions {
    document_type?: number | string | null;
    document_id?: string | null;
    validation_id?: string | null;
    start_date?: string | null; // formatted as 'YYYY-MM-DD' or ISO string
    end_date?: string | null;   // formatted as 'YYYY-MM-DD' or ISO string
    resource_id?: string | null;
    company_id?: string | null;
    status?: string | null;

}

