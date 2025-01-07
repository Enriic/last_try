// src/components/ValidationFilters/ValidationFilters.tsx

import React, { useState, useEffect } from 'react';
import { Row, Col, Input, DatePicker, Select, AutoComplete, message } from 'antd';
import { Validation, DocumentType, Document } from '../../../types';
import { getDocuments } from '../../../services/documentService'; // Ajusta la ruta según corresponda
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

    const [documents, setDocuments] = useState<Document[]>([]);
    const [documentOptions, setDocumentOptions] = useState<{ value: string }[]>([]);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const data = await getDocuments();
            setDocuments(data);
        } catch (error) {
            message.error('Error al obtener la lista de documentos');
        }
    };

    const handleSearch = (value: string) => {
        const options = documents
            .filter((doc) =>
                doc.name.toLowerCase().includes(value.toLowerCase())
            )
            .map((doc) => ({ value: doc.name }));
        setDocumentOptions(options);
        setSearchText(value);
        emitFiltersChange({ searchText: value });
    };

    const handleSelect = (value: string) => {
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
        <div className='validation-filters-container'>
            <Row gutter={16} className='validation-filters-row'>
                <Col xs={24} sm={24} md={24} lg={24} xl={11} xxl={7} className='validation-filters-col'>
                    <span>Nombre de documento: </span>
                    <AutoComplete
                        style={{ width: 200 }}
                        options={documentOptions}
                        onSelect={handleSelect}
                        onSearch={handleSearch}
                        placeholder="Buscar por nombre de documento"
                        allowClear
                        value={searchText}
                    >
                        <Input />
                    </AutoComplete>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={11} xxl={7} className='validation-filters-col'>
                    <span>Fecha: </span>
                    <RangePicker onChange={handleDateChange} />
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={11} xxl={6} className='validation-filters-col'>
                    <span>Tipo de Documento: </span>
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
                <Col xs={24} sm={24} md={24} lg={24} xl={11} xxl={3} className='validation-filters-col'>
                    <span>Resultado: </span>
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
        </div>
    );
};

export default ValidationFilters;