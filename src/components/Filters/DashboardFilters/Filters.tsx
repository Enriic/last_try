// src/components/Filters/Filters.tsx

import React, { useState } from 'react';
import { DatePicker, Row, Col, Tooltip } from 'antd';
import { Validation, ValidationFilterOptions } from '../../../types';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import './Filters.less';
import JunoButton from '../../common/JunoButton';
import { JunoButtonTypes } from '../../common/JunoButton/JunoButton.types';
import DocumentTypeSelect from '../../common/SearchableSelect/DocumentTypeSelect/DocumentTypeSelect';
import { useTranslation } from 'react-i18next';

type RangeValue = [Dayjs | null, Dayjs | null] | null;

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);

interface FiltersProps {
    onApplyFilters: (filters: ValidationFilterOptions) => void;
    onClearFilters: () => void;
}

const { RangePicker } = DatePicker;

const Filters: React.FC<FiltersProps> = ({ onApplyFilters, onClearFilters }) => {
    const { t } = useTranslation();
    const [dateRange, setDateRange] = useState<RangeValue | null>(null);
    const [documentType, setDocumentType] = useState<string | number | null>(null);

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
        <Row gutter={[16, 16]} className="dash-filter-row" justify="start">
            <Col xs={24} sm={24} md={12} lg={6} xl={8} className="dash-filter-col">
                <Tooltip title={t('filters.dateTooltip')}>
                    <span className="dash-filter-label">{t('filters.dateLabel')}: </span>
                </Tooltip>
                <RangePicker
                    value={dateRange}
                    onChange={handleDateChange}
                    style={{ width: '100%' }}
                />
            </Col>
            <Col xs={24} sm={24} md={12} lg={6} xl={8} className="dash-filter-col">
                <Tooltip title={t('filters.documentTypeTooltip')}>
                    <span className="dash-filter-label">{t('filters.documentTypeLabel')}: </span>
                </Tooltip>
                <DocumentTypeSelect
                    value={documentType?.toString() || null}
                    onChange={handleDocumentTypeChange}
                    placeholder={t('filters.documentTypePlaceholder')}
                    style={{ width: '100%' }}
                />
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={8} className="dash-filter-col" style={{ justifyContent: 'flex-end' }}>
                <JunoButton buttonType={JunoButtonTypes.Ok} type="primary" onClick={applyFilters} style={{ marginRight: 8 }}>
                    {t('common.apply')}
                </JunoButton>
                <JunoButton buttonType={JunoButtonTypes.Cancel} type="default" onClick={clearFilters}>
                    {t('common.clear')}
                </JunoButton>
            </Col>
        </Row>
    );
};

export default Filters;