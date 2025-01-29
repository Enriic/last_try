// src/components/ValidationFilters/ValidationFilters.tsx

import React, { useState } from 'react';
import { Row, Col, DatePicker, Select } from 'antd';
import { Validation } from '../../../types';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import DocumentSelect from '../../common/SearchableSelect/DocumentSelect/DocumentSelect.tsx';
import CompanySelect from '../../common/SearchableSelect/CompanySelect/CompanySelect.tsx';
import ValidationSelect from '../../common/SearchableSelect/ValidationSelect/ValidationSelect.tsx';
import ResourceSelect from '../../common/SearchableSelect/ResourceSelect/ResourceSelect.tsx';
import JunoButton from '../../common/JunoButton/JunoButton.tsx';
import { JunoButtonTypes } from '../../common/JunoButton/JunoButton.types';
import './ValidationFilters.less';
import { ValidationFilterOptions } from '../../../types';
import DocumentTypeSelect from '../../common/SearchableSelect/DocumentTypeSelect/DocumentTypeSelect.tsx';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);

type RangeValue = [Dayjs | null, Dayjs | null] | null;

const { RangePicker } = DatePicker;
const { Option } = Select;

interface ValidationFiltersProps {
    validations: Validation[];
    onApplyFilters: (filters: ValidationFilterOptions) => void;
    onClearFilters: () => void;
}

const ValidationFilters: React.FC<ValidationFiltersProps> = ({ onApplyFilters, onClearFilters }) => {
    const [DocumentId, setDocumentId] = useState<string | null>(null);
    const [validationId, setValidationId] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<RangeValue>(null);
    const [documentType, setDocumentType] = useState<number | string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [resourceId, setResourceId] = useState<string | null>(null);


    const applyFilters = () => {
        const filters: ValidationFilterOptions = {
            document_id: DocumentId,
            validation_id: validationId,
            start_date: dateRange && dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : null,
            end_date: dateRange && dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : null,
            document_type: documentType,
            status: status,
            company_id: companyId,
            resource_id: resourceId,

        };
        onApplyFilters(filters);
    };

    const clearFilters = () => {
        setDocumentId(null);
        setValidationId(null);
        setDateRange(null);
        setDocumentType(null);
        setStatus(null);
        setCompanyId(null);
        setResourceId(null);

        onClearFilters();
    };

    const handleDocumentIdChange = (value: string | null) => {
        setDocumentId(value);
    };

    const handleValidationIdChange = (value: string | null) => {
        setValidationId(value);
    };

    const handleDateChange = (dates: RangeValue) => {
        setDateRange(dates);
    };

    const handleDocumentTypeChange = (value: number | string | null) => {
        setDocumentType(value);
        console.log("Filter value for document typw:", value);
    };

    const handleStatusChange = (value: string | null) => {
        setStatus(value);
    };

    const handleCompanyChange = (value: string | null) => {
        setCompanyId(value);
    };

    const handleResourceChange = (value: string | null) => {
        setResourceId(value);
    };


    return (
        <div className='validation-filters-container'>
            <Row gutter={16} className='validation-filters-row' align={'middle'} justify={'start'}>
                <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6} className='validation-filters-col'>
                    <span style={{ whiteSpace: 'nowrap' }}>Documento: </span>
                    <DocumentSelect
                        value={DocumentId}
                        onChange={handleDocumentIdChange}
                        placeholder="Selecciona un documento"
                        style={{ width: 250 }}
                    />
                </Col>

                <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6} className='validation-filters-col'>
                    <span style={{ whiteSpace: 'nowrap' }}>Validación: </span>
                    <ValidationSelect
                        value={validationId}
                        onChange={handleValidationIdChange}
                        placeholder="Selecciona una validación"
                        style={{ width: 250 }}
                    />
                </Col>

                <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6} className='validation-filters-col'>
                    <span style={{ whiteSpace: 'nowrap' }}>Fecha: </span>
                    <RangePicker
                        onChange={handleDateChange}
                        style={{ width: 250 }}
                    />
                </Col>

                <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6} className='validation-filters-col'>
                    <span style={{ whiteSpace: 'nowrap' }}>Tipo Documento: </span>
                    <DocumentTypeSelect
                        value={documentType?.toString() || null}
                        onChange={handleDocumentTypeChange}
                        placeholder="Selecciona un tipo de documento"
                        style={{ width: 250 }}
                    />
                </Col>

                <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6} className='validation-filters-col'>
                    <span style={{ whiteSpace: 'nowrap' }}>Resultado: </span>
                    <Select
                        placeholder="Resultado"
                        style={{ width: 250 }}
                        onChange={handleStatusChange}
                        allowClear
                        value={status || undefined}
                    >
                        <Option value="success">Éxito</Option>
                        <Option value="failure">Fallo</Option>
                    </Select>
                </Col>

                <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6} className='validation-filters-col'>
                    <span style={{ whiteSpace: 'nowrap' }}>Recurso: </span>
                    <ResourceSelect
                        value={resourceId}
                        onChange={handleResourceChange}
                        placeholder="Selecciona un recurso"
                        style={{ width: 250 }}
                    />
                </Col>

                <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6} className='validation-filters-col'>
                    <span style={{ whiteSpace: 'nowrap' }}>Company: </span>
                    <CompanySelect
                        value={companyId}
                        onChange={handleCompanyChange}
                        placeholder="Selecciona una compañía"
                        style={{ width: 250 }}
                    />
                </Col>
            </Row>

            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24} style={{ display: 'flex', justifyContent: 'end', marginTop: 16, gap: 10 }}>
                <JunoButton buttonType={JunoButtonTypes.Ok} type='primary' onClick={applyFilters}>Aplicar</JunoButton>
                <JunoButton buttonType={JunoButtonTypes.Cancel} type='default' onClick={clearFilters}>Limpiar</JunoButton>
            </Col>
        </div>
    );

};

export default ValidationFilters;