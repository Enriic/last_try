// src/components/ValidationFilters/ValidationFilters.tsx

import React, { useState, useEffect } from 'react';
import { Row, Col, Input, DatePicker, Select, AutoComplete, notification } from 'antd';
import { Validation, DocumentType } from '../../../types';
import { getValidations } from '../../../services/validationService';
import { useAuth } from '../../../context/AuthContext';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import DocumentSelect from '../../common/SearchableSelect/DocumentSelect/DocumentSelect.tsx';
import CompanySelect from '../../common/SearchableSelect/CompanySelect/CompanySelect.tsx';
import ValidationSelect from '../../common/SearchableSelect/ValidationSelect/ValidationSelect.tsx';
import ResourceSelect from '../../common/SearchableSelect/ResourceSelect/ResourceSelect.tsx';
import './ValidationFilters.less';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);

type RangeValue = [Dayjs | null, Dayjs | null] | null;

const { RangePicker } = DatePicker;
const { Option } = Select;

interface ValidationFiltersProps {
    documentTypes: DocumentType[];
    onFiltersChange: (filters: {
        searchTextDocName: string | null;
        searchTextValId: string | null;
        dateRange: RangeValue;
        documentType: number | null;
        resultFilter: string | null;
        company: string | null;
        resource: string | null;
    }) => void;
}

const ValidationFilters: React.FC<ValidationFiltersProps> = ({ documentTypes, onFiltersChange }) => {
    const [searchTextDocName, setSearchTextDocName] = useState<string | null>(null);
    const [searchTextValId, setSearchTextValId] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<RangeValue>(null);
    const [documentType, setDocumentType] = useState<number | null>(null);
    const [resultFilter, setResultFilter] = useState<string | null>(null);
    const [validations, setValidations] = useState<Validation[]>([]);
    const [company, setCompany] = useState<string | null>(null);
    const [resource, setResource] = useState<string | null>(null);


    const { user } = useAuth();

    useEffect(() => {
        fetchDocumentsWithValidations();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchDocumentsWithValidations = async () => {
        try {
            const data = await getValidations(true, user);
            setValidations(data);
            console.log(documentTypes);
        } catch (error) {
            notification.error({
                message: 'Upps! Something went wrong',
                description: 'An error occurred while fetching the validations',
                duration: 3,
            });
            console.log(error)
        }
    };

    const handleSelectDocName = (value: string | null) => {
        setSearchTextDocName(value);
        emitFiltersChange({ searchTextDocName: value });
    };

    const handleCompanyChange = (selectedCompany: string | null) => {
        setCompany(selectedCompany);
        emitFiltersChange({ company: selectedCompany });
    };

    const handleResourceChange = (selectedResource: string | null) => {
        setResource(selectedResource);
        emitFiltersChange({ resource: selectedResource });
    };

    const handleSelectValId = (value: string | null) => {
        setSearchTextValId(value);
        emitFiltersChange({ searchTextValId: value });
    };

    const handleDateChange = (dates: RangeValue) => {
        setDateRange(dates);
        emitFiltersChange({ dateRange: dates });
    };

    const handleDocumentTypeChange = (value: number | null) => {
        setDocumentType(value);
        emitFiltersChange({ documentType: value });
    };

    const handleResultFilterChange = (value: string | null) => {
        setResultFilter(value);
        emitFiltersChange({ resultFilter: value });
    };

    const emitFiltersChange = (changedFilter: Partial<{
        searchTextDocName: string | null;
        searchTextValId: string | null;
        dateRange: RangeValue;
        documentType: number | null;
        resultFilter: string | null;
        company: string | null;
        resource: string | null;
    }>) => {
        const filters = {
            searchTextDocName,
            searchTextValId,
            dateRange,
            documentType,
            resultFilter,
            company,
            resource, 
            ...changedFilter,
        };
        onFiltersChange(filters);
    };

    return (
        <div className='validation-filters-container'>
            <Row gutter={16} className='validation-filters-row'>
                <Col xs={24} sm={24} md={24} lg={24} xl={7} xxl={6} className='validation-filters-col'>
                    <span>Nombre Documento: </span>
                    <DocumentSelect
                        value={searchTextDocName}
                        onChange={handleSelectDocName}
                        placeholder="Selecciona una compañía"
                        style={{ width: 250 }}
                    />

                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={7} xxl={6} className='validation-filters-col'>
                    <span>Fecha: </span>
                    <RangePicker
                        onChange={handleDateChange}
                        style={{ width: 250 }}
                    />
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={7} xxl={6} className='validation-filters-col'>
                    <span>Tipo de Documento: </span>
                    <Select
                        placeholder="Tipo de Documento"
                        style={{ width: 250 }}
                        onChange={handleDocumentTypeChange}
                        allowClear
                    >
                        {documentTypes.map((type) => (
                            <Option key={type.id} value={type.id}>
                                {type.name}
                            </Option>
                        ))}
                    </Select>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={7} xxl={6} className='validation-filters-col'>
                    <span>Resultado: </span>
                    <Select
                        placeholder="Resultado"
                        style={{ width: 250 }}
                        onChange={handleResultFilterChange}
                        allowClear
                    >
                        <Option value="success">Éxito</Option>
                        <Option value="failure">Fallo</Option>
                        <Option value="pending">Pendiente</Option>
                    </Select>
                </Col>


                <Col xs={24} sm={24} md={24} lg={24} xl={7} xxl={6} className='validation-filters-col'>
                    <span>Validacion id: </span>
                    <ValidationSelect
                        value={searchTextValId}
                        onChange={handleSelectValId}
                        placeholder="Selecciona una compañía"
                        style={{ width: 250 }}
                    />
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={7} xxl={6} className='validation-filters-col'>
                    <span>Resource id: </span>
                    <ResourceSelect
                        value={resource}
                        onChange={handleResourceChange}
                        placeholder="Selecciona una compañía"
                        style={{ width: 250 }}
                    />
                </Col>


                <Col xs={24} sm={24} md={24} lg={24} xl={7} xxl={6} className='validation-filters-col'>
                    <span>Company id: </span>
                    <CompanySelect
                        value={company}
                        onChange={handleCompanyChange}
                        placeholder="Selecciona una compañía"
                        style={{ width: 250 }}
                    />
                </Col>
            </Row>
        </div>

    );

};

export default ValidationFilters;