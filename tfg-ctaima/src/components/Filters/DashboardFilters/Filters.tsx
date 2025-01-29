// src/components/Filters/Filters.tsx

import React, { useState } from 'react';
import { DatePicker, Row, Col } from 'antd';
import { Validation, ValidationFilterOptions } from '../../../types';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import './Filters.less';
import JunoButton from '../../common/JunoButton';
import { JunoButtonTypes } from '../../common/JunoButton/JunoButton.types';
import DocumentTypeSelect from '../../common/SearchableSelect/DocumentTypeSelect/DocumentTypeSelect';

type RangeValue = [Dayjs | null, Dayjs | null] | null;

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);

interface FiltersProps {
    validations: Validation[];
    onApplyFilters: (filters: ValidationFilterOptions) => void;
    onClearFilters: () => void;
}

const { RangePicker } = DatePicker;


const Filters: React.FC<FiltersProps> = ({ onApplyFilters, onClearFilters }) => {
    const [dateRange, setDateRange] = useState<RangeValue | null>(null);
    const [documentType, setDocumentType] = useState<string |number | null>(null);


    const handleDateChange = (dates: RangeValue | null) => {
        setDateRange(dates);
    };

    const clearFilters = () => {
        setDateRange(null);
        setDocumentType(null);

        onClearFilters();
    };

    const handleDocumentTypeChange = (value: string | number | null) => {
        setDocumentType(value);
    };

    const applyFilters = () => {
        const filters: ValidationFilterOptions = {
            start_date: dateRange && dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : null,
            end_date: dateRange && dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : null,
            document_type: documentType,
        };
        onApplyFilters(filters); 
    };

    return (
        <Row gutter={16} style={{ marginBottom: 24}} align={'middle'}>
            <Col xs={24} sm={24} md={12} lg={8} xl={8} xxl={8}>
                <RangePicker
                    value={dateRange}
                    onChange={handleDateChange}
                />
            </Col>
            <Col xs={24} sm={24} md={12} lg={8} xl={8} xxl={8}>
                <DocumentTypeSelect
                    value={documentType?.toString() || null}
                    onChange={handleDocumentTypeChange}
                    placeholder="Selecciona un tipo de documento"
                    style={{ width: 250 }}
                />
            </Col>

            <Col xs={24} sm={24} md={12} lg={8} xl={8} xxl={8} style={{ display:'flex', gap: 10 }}>
                <JunoButton buttonType={JunoButtonTypes.Ok} type='primary' onClick={applyFilters}>Aplicar</JunoButton>
                <JunoButton buttonType={JunoButtonTypes.Cancel} type='default' onClick={clearFilters}>Limpiar</JunoButton>
            </Col>
        </Row>
    );
};

export default Filters;
