// src/components/ValidationFilters/ValidationFilters.tsx

import React, { useState } from 'react';
import { Row, Col, Input, DatePicker, Select } from 'antd';
import { Validation, DocumentType } from '../../../types';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import './ValidationFilters.less';

// Añadir plugins a dayjs
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);

// Definir el tipo RangeValue
type RangeValue = [Dayjs | null, Dayjs | null] | null;

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

interface ValidationFiltersProps {
    documentTypes: DocumentType[];
    onFiltersChange: (filters: {
        searchText: string;
        dateRange: RangeValue;
        documentType: number | null;
        resultFilter: string | null;
    }) => void;
}

const ValidationFilters: React.FC<ValidationFiltersProps> = ({ documentTypes, onFiltersChange }) => {
    const [searchText, setSearchText] = useState<string>('');
    const [dateRange, setDateRange] = useState<RangeValue>(null);
    const [documentType, setDocumentType] = useState<number | null>(null);
    const [resultFilter, setResultFilter] = useState<string | null>(null);

    const handleSearch = (value: string) => {
        setSearchText(value);
        emitFiltersChange({ searchText: value });
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
        searchText: string;
        dateRange: RangeValue;
        documentType: number | null;
        resultFilter: string | null;
    }>) => {
        const filters = {
            searchText,
            dateRange,
            documentType,
            resultFilter,
            ...changedFilter,
        };
        onFiltersChange(filters);
    };

    return (
        <Row gutter={16} >
            <Col xs={24} sm={12} md={12} style={{ marginBottom: 16 }}>
                <Search
                    placeholder="Buscar por nombre de documento"
                    onSearch={handleSearch}
                    allowClear
                    style={{ width: 200 }}
                />
            </Col>
            <Col xs={24} sm={12} md={12}>
                <RangePicker onChange={handleDateChange} />
            </Col>
            <Col xs={24} sm={12} md={12} className='validation-filters'>
                <Select
                    placeholder="Tipo de Documento"
                    style={{ width: 150 }}
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
            <Col xs={24} sm={12} md={6}>
                <Select
                    placeholder="Resultado"
                    style={{ width: 120 }}
                    onChange={handleResultFilterChange}
                    allowClear
                >
                    <Option value="success">Éxito</Option>
                    <Option value="failure">Fallo</Option>
                </Select>
            </Col>
        </Row>
    );
};

export default ValidationFilters;