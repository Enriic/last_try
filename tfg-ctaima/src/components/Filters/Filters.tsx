// src/components/Filters/Filters.tsx

import React, { useState, useEffect } from 'react';
import { DatePicker, Select, Row, Col } from 'antd';
import { Validation } from '../../types';
import { getDocumentTypes } from '../../services/documentService';
import dayjs, { Dayjs } from 'dayjs';
import { DocumentType } from '../../types';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import './Filters.less'

type RangeValue = [Dayjs | null, Dayjs | null] | null;

// Add plugins to dayjs
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);

interface FiltersProps {
    validations: Validation[];
    onFilter: (filteredData: Validation[]) => void;
}

const { RangePicker } = DatePicker;
const { Option } = Select;

const Filters: React.FC<FiltersProps> = ({ validations, onFilter }) => {
    const [dateRange, setDateRange] = useState<RangeValue>(null);
    const [documentType, setDocumentType] = useState<string | null>(null);
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);

    useEffect(() => {
        fetchDocumentTypes();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [dateRange, documentType]);

    const fetchDocumentTypes = async () => {
        const data = await getDocumentTypes();
        data.unshift({ id: 0, name: 'Todos' });
        setDocumentTypes(data);
    };

    const applyFilters = () => {
        let filteredData = [...validations];

        if (dateRange) {
            const [start, end] = dateRange;

            if (start && end) {
                filteredData = filteredData.filter((v) => {
                    const validationTimestamp = dayjs(v.timestamp);
                    if (!validationTimestamp.isValid()) {
                        // Handle invalid dates if necessary
                        return false;
                    }
                    return (
                        start.isSameOrBefore(validationTimestamp, 'day') &&
                        end.isSameOrAfter(validationTimestamp, 'day')
                    );
                });
            }
        }

        if (documentType) {
            if (documentType === 'Todos') {
                onFilter(filteredData);
                return;
            }
            filteredData = filteredData.filter((v) => v.document_type === documentType);
        }

        onFilter(filteredData);
    };


    return (
        <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={8}>
                <RangePicker onChange={(dates) => setDateRange(dates)} />
            </Col>
            <Col xs={24} sm={12} md={8}>
                <Select
                    placeholder="Tipo de Documento"
                    style={{ width: '100%' }}
                    onChange={(value) => setDocumentType(value)}
                >
                    {documentTypes.map((type) => (
                        <Option key={type.id} value={type.name}>
                            {type.name}
                        </Option>
                    ))}
                </Select>
            </Col>
        </Row>
    );
};

export default Filters;