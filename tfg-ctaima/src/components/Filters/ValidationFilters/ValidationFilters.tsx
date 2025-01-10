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
        searchTextDocName: string;
        searchTextValId: string;
        dateRange: RangeValue;
        documentType: number | null;
        resultFilter: string | null;
    }) => void;
}

const ValidationFilters: React.FC<ValidationFiltersProps> = ({ documentTypes, onFiltersChange }) => {
    const [searchTextDocName, setSearchTextDocName] = useState<string>('');
    const [searchTextValId, setSearchTextValId] = useState<string>('');
    const [dateRange, setDateRange] = useState<RangeValue>(null);
    const [documentType, setDocumentType] = useState<number | null>(null);
    const [resultFilter, setResultFilter] = useState<string | null>(null);
    const [validations, setValidations] = useState<Validation[]>([]);
    const [documentNameOptions, setDocumentNameOptions] = useState<{ value: string }[]>([]);
    const [validationIdOptions, setValidationIdOptions] = useState<{ value: string }[]>([]);

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
        }
    };

    const handleSearchDocName = (value: string) => {
        const uniqueOptions = validations
            .filter(
                (val, index, self) =>
                    val.document_info?.name.toLowerCase().includes(value.toLowerCase()) &&
                    index === self.findIndex((t) => t.document_info?.name === val.document_info?.name)
            )
            .map((val) => ({ value: val.document_info?.name }));
        setDocumentNameOptions(uniqueOptions);
        setSearchTextDocName(value);
        emitFiltersChange({ searchTextDocName: value });
    };

    const handleSelectDocName = (value: string) => {
        setSearchTextDocName(value);
        emitFiltersChange({ searchTextDocName: value });
    };


    const handleSearchValId = (value: string) => {
        const uniqueOptions = validations
            .filter(
                (val, index, self) =>
                    val.id.toLowerCase().includes(value.toLowerCase()) &&
                    index === self.findIndex((t) => t.id === val.id)
            )
            .map((val) => ({ value: val.id }));

        setValidationIdOptions(uniqueOptions);
        setSearchTextValId(value);
        emitFiltersChange({ searchTextValId: value });
    };

    const handleSelectValId = (value: string) => {
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
        searchTextDocName: string;
        searchTextValId: string;
        dateRange: RangeValue;
        documentType: number | null;
        resultFilter: string | null;
    }>) => {
        const filters = {
            searchTextDocName,
            searchTextValId,
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
                <Col xs={24} sm={24} md={24} lg={24} xl={7} xxl={6} className='validation-filters-col'>
                    <span>Nombre de documento: </span>
                    <AutoComplete
                        style={{ width: 250 }}
                        options={documentNameOptions}
                        onSelect={handleSelectDocName}
                        onSearch={handleSearchDocName}
                        placeholder="Buscar por nombre de documento"
                        allowClear
                        value={searchTextDocName}
                    >
                        <Input />
                    </AutoComplete>
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
                    <span>Id de validación: </span>
                    <AutoComplete
                        style={{ width: 250 }}
                        options={validationIdOptions}
                        onSelect={handleSelectValId}
                        onSearch={handleSearchValId}
                        placeholder="Buscar por id de validación"
                        allowClear
                        value={searchTextValId}
                    >
                        <Input />
                    </AutoComplete>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={7} xxl={6} className='validation-filters-col'>
                    <span>Requierment id: </span>
                    <Input style={{ width: 250 }} placeholder='No functional' />
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={7} xxl={6} className='validation-filters-col'>
                    <span>Supplier id: </span>
                    <Input style={{ width: 250 }} placeholder='No functional' />
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={7} xxl={6} className='validation-filters-col'>
                    <span>Customer id: </span>
                    <Input style={{ width: 250 }} placeholder='No functional' />
                </Col>
            </Row>
        </div>

    );

};

export default ValidationFilters;