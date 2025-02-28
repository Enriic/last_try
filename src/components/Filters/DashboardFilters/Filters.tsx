// src/components/Filters/Filters.tsx

import React, { useState, useEffect } from 'react';
import { DatePicker, Row, Col, Tooltip } from 'antd';
import { ValidationFilterOptions } from '../../../types/filters';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import './Filters.less';
import JunoButton from '../../common/JunoButton';
import { JunoButtonTypes } from '../../common/JunoButton/JunoButton.types';
import DocumentTypeSelect from '../../common/SearchableSelect/DocumentTypeSelect/DocumentTypeSelect';
import { useTranslation } from 'react-i18next';
import { useWindowSize } from '../../../hooks/useWindowSize';
import { DateFormat } from '../../../types/format';

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
    const [showTooltips, setShowTooltips] = useState(false);

    // Get window width to determine if tooltips should be shown
    const { width } = useWindowSize();

    useEffect(() => {
        setShowTooltips(width < 1200);
    }, [width]);

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
            start_date: dateRange && dateRange[0] ? dateRange[0].format(DateFormat) : null,
            end_date: dateRange && dateRange[1] ? dateRange[1].format(DateFormat) : null,
            document_type: documentType,
        };
        onApplyFilters(filters);
    };

    // Render date label with optional tooltip
    const renderDateLabel = () => {
        const label = <span style={{ textAlign: 'right' }} className="dash-filter-label">{t('filters.dateLabel')}: </span>;

        return showTooltips ? (
            <Tooltip title={t('filters.dateTooltip')} overlayStyle={{ fontSize: "12px" }}>
                {label}
            </Tooltip>
        ) : label;
    };

    // Render document type label with optional tooltip
    const renderDocTypeLabel = () => {
        const label = <span className="dash-filter-label">{t('filters.documentTypeLabel')}: </span>;

        return showTooltips ? (
            <Tooltip title={t('filters.documentTypeTooltip')} overlayStyle={{ fontSize: "12px" }}>
                {label}
            </Tooltip>
        ) : label;
    };

    return (
        <Row gutter={[16, 16]} className="dash-filter-row" align="middle">
            {/* Date filter */}
            <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={8} className="dash-filter-col" >
                {renderDateLabel()}
                <div className="filter-input-wrapper">
                    <RangePicker
                        value={dateRange}
                        onChange={handleDateChange}
                        className="filter-input"
                    />
                </div>
            </Col>

            {/* Document type filter */}
            <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={8} className="dash-filter-col">
                {renderDocTypeLabel()}
                <div className="filter-input-wrapper">
                    <DocumentTypeSelect
                        value={documentType?.toString() || null}
                        onChange={handleDocumentTypeChange}
                        placeholder={t('filters.documentTypePlaceholder')}
                        style={{width: '100%'}}
                    />
                </div>
            </Col>

            {/* Action buttons */}
            <Col xs={24} sm={24} md={24} lg={24} xl={8} xxl={8} className="dash-filter-col dash-filter-buttons">
                <div className="button-container">
                    <JunoButton buttonType={JunoButtonTypes.Ok} type="primary" onClick={applyFilters}>
                        {t('common.apply')}
                    </JunoButton>
                    <JunoButton buttonType={JunoButtonTypes.Cancel} type="default" onClick={clearFilters}>
                        {t('common.clear')}
                    </JunoButton>
                </div>
            </Col>
        </Row>
    );
};

export default Filters;