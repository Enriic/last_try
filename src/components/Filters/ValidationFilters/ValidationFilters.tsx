// src/components/ValidationFilters/ValidationFilters.tsx

import React, { useState } from 'react';
import { Row, Col, DatePicker, Select, Tooltip } from 'antd';
import { Validation, ValidationFilterOptions } from '../../../types';
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
import DocumentTypeSelect from '../../common/SearchableSelect/DocumentTypeSelect/DocumentTypeSelect.tsx';
import './ValidationFilters.less';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    const [documentId, setDocumentId] = useState<string | null>(null);
    const [validationId, setValidationId] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<RangeValue>(null);
    const [documentType, setDocumentType] = useState<number | string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [resourceId, setResourceId] = useState<string | null>(null);

    const applyFilters = () => {
        const filters: ValidationFilterOptions = {
            document_id: documentId,
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
        console.log("Filter value for document type:", value);
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
            <Row gutter={16} className='validation-filters-row' align='middle' justify='start'>
                <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6} className='validation-filters-col'>
                    <Tooltip title={t('validationFilters.documentTooltip')} overlayStyle={{ fontSize: "12px" }}>
                        <span className="label-text">{t('validationFilters.documentLabel')}: </span>
                    </Tooltip>
                    <DocumentSelect
                        value={documentId}
                        onChange={handleDocumentIdChange}
                        placeholder={t('validationFilters.documentPlaceholder')}
                        style={{ width: 250 }}
                    />
                </Col>

                <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6} className='validation-filters-col'>
                    <Tooltip title={t('validationFilters.validationTooltip')} overlayStyle={{ fontSize: "12px" }}>
                        <span className="label-text">{t('validationFilters.validationLabel')}</span>
                    </Tooltip>
                    <ValidationSelect
                        value={validationId}
                        onChange={handleValidationIdChange}
                        placeholder={t('validationFilters.validationPlaceholder')}
                        style={{ width: 250 }}
                    />
                </Col>

                <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6} className='validation-filters-col'>
                    <Tooltip title={t('validationFilters.dateTooltip')} overlayStyle={{ fontSize: "12px" }}>
                        <span className="label-text">{t('validationFilters.dateLabel')}: </span>
                    </Tooltip>
                    <RangePicker
                        onChange={handleDateChange}
                        style={{ width: 250 }}
                        value={dateRange}
                    />
                </Col>

                <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6} className='validation-filters-col'>
                    <Tooltip title={t('validationFilters.documentTypeTooltip')} overlayStyle={{ fontSize: "12px" }}>
                        <span className="label-text">{t('validationFilters.documentTypeLabel')}: </span>
                    </Tooltip>
                    <DocumentTypeSelect
                        value={documentType?.toString() || null}
                        onChange={handleDocumentTypeChange}
                        placeholder={t('validationFilters.documentTypePlaceholder')}
                        style={{ width: 250 }}
                    />
                </Col>

                <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6} className='validation-filters-col'>
                    <Tooltip title={t('validationFilters.resultTooltip')} overlayStyle={{ fontSize: "12px" }}>
                        <span className="label-text">{t('validationFilters.resultLabel')}: </span>
                    </Tooltip>
                    <Select
                        placeholder={t('validationFilters.resultPlaceholder')}
                        style={{ width: 250 }}
                        onChange={handleStatusChange}
                        allowClear
                        value={status || undefined}
                    >
                        <Option value="success">{t('validationFilters.successOption')}</Option>
                        <Option value="failure">{t('validationFilters.failureOption')}</Option>
                    </Select>
                </Col>

                <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6} className='validation-filters-col'>
                    <Tooltip title={t('validationFilters.resourceTooltip')} overlayStyle={{ fontSize: "12px" }}>
                        <span className="label-text">{t('validationFilters.resourceLabel')}: </span>
                    </Tooltip>
                    <ResourceSelect
                        value={resourceId}
                        onChange={handleResourceChange}
                        placeholder={t('validationFilters.resourcePlaceholder')}
                        style={{ width: 250 }}
                    />
                </Col>

                <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6} className='validation-filters-col'>
                    <Tooltip title={t('validationFilters.companyTooltip')} overlayStyle={{ fontSize: "12px" }}>
                        <span className="label-text">{t('validationFilters.companyLabel')}: </span>
                    </Tooltip>
                    <CompanySelect
                        value={companyId}
                        onChange={handleCompanyChange}
                        placeholder={t('validationFilters.companyPlaceholder')}
                        style={{ width: 250 }}
                    />
                </Col>
            </Row>

            <Row>
                <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24} style={{ display: 'flex', justifyContent: 'end', marginTop: 16, gap: 10 }}>
                    <JunoButton buttonType={JunoButtonTypes.Ok} type='primary' onClick={applyFilters}>
                        {t('common.apply')}
                    </JunoButton>
                    <JunoButton buttonType={JunoButtonTypes.Cancel} type='default' onClick={clearFilters}>
                        {t('common.clear')}
                    </JunoButton>
                </Col>
            </Row>
        </div>
    )};

export default ValidationFilters;