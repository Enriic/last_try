// src/components/CompanyFilters/CompanyFilters.tsx

import React, { useState } from 'react';
import { Row, Col, Tooltip } from 'antd';
import { Company } from '../../../types';
import { ValidationFilterOptions } from '../../../types/filters.ts';
import CompanySelect from '../../common/SearchableSelect/CompanySelect/CompanySelect.tsx';

import JunoButton from '../../common/JunoButton/JunoButton.tsx';
import { JunoButtonTypes } from '../../common/JunoButton/JunoButton.types';
import './CompanyFilters.less';
import { useTranslation } from 'react-i18next';

interface CompanyFiltersProps {
    companies: Company[];
    onApplyFilters: (filters: ValidationFilterOptions) => void;
    onClearFilters: () => void;
}

const CompanyFilters: React.FC<CompanyFiltersProps> = ({ onApplyFilters, onClearFilters }) => {
    const { t } = useTranslation();
    const [companyId, setCompanyId] = useState<string | null>(null);

    const applyFilters = () => {
        const filters: ValidationFilterOptions = {
            company_id: companyId,

        };
        onApplyFilters(filters);
    };

    const clearFilters = () => {
        
        setCompanyId(null);
        onClearFilters();
    };


    const handleCompanyChange = (value: string | null) => {
        setCompanyId(value);
    };


    return (
        <div className='validation-filters-container'>
            <Row gutter={16} className='validation-filters-row' align='middle' justify='start'>
                <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6} className='validation-filters-col'>
                    <Tooltip title={t('CompanyFilters.documentTooltip')} overlayStyle={{ fontSize: "12px" }}>
                        <span className="label-text">{t('CompanyFilters.documentLabel')}: </span>
                    </Tooltip>
                    {/* <DocumentSelect
                        value={documentId}
                        onChange={handleDocumentIdChange}
                        placeholder={t('CompanyFilters.documentPlaceholder')}
                        style={{ width: 250 }}
                    /> */}
                </Col>

                <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6} className='validation-filters-col'>
                    <Tooltip title={t('CompanyFilters.validationTooltip')} overlayStyle={{ fontSize: "12px" }}>
                        <span className="label-text">{t('CompanyFilters.validationLabel')}</span>
                    </Tooltip>
                    {/* <ValidationSelect
                        value={validationId}
                        onChange={handleValidationIdChange}
                        placeholder={t('CompanyFilters.validationPlaceholder')}
                        style={{ width: 250 }}
                    /> */}
                </Col>

                <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6} className='validation-filters-col'>
                    <Tooltip title={t('CompanyFilters.dateTooltip')} overlayStyle={{ fontSize: "12px" }}>
                        <span className="label-text">{t('CompanyFilters.dateLabel')}: </span>
                    </Tooltip>
                    {/* <RangePicker
                        onChange={handleDateChange}
                        style={{ width: 250 }}
                        value={dateRange}
                    /> */}
                </Col>

                <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6} className='validation-filters-col'>
                    <Tooltip title={t('CompanyFilters.documentTypeTooltip')} overlayStyle={{ fontSize: "12px" }}>
                        <span className="label-text">{t('CompanyFilters.documentTypeLabel')}: </span>
                    </Tooltip>
                    {/* <DocumentTypeSelect
                        value={documentType?.toString() || null}
                        onChange={handleDocumentTypeChange}
                        placeholder={t('CompanyFilters.documentTypePlaceholder')}
                        style={{ width: 250 }}
                    /> */}
                </Col>

                <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6} className='validation-filters-col'>
                    <Tooltip title={t('CompanyFilters.resultTooltip')} overlayStyle={{ fontSize: "12px" }}>
                        <span className="label-text">{t('CompanyFilters.resultLabel')}: </span>
                    </Tooltip>
                    {/* <Select
                        placeholder={t('CompanyFilters.resultPlaceholder')}
                        style={{ width: 250 }}
                        onChange={handleStatusChange}
                        allowClear
                        value={status || undefined}
                    >
                        <Option value="success">{t('CompanyFilters.successOption')}</Option>
                        <Option value="failure">{t('CompanyFilters.failureOption')}</Option>
                    </Select> */}
                </Col>

                <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6} className='validation-filters-col'>
                    <Tooltip title={t('CompanyFilters.resourceTooltip')} overlayStyle={{ fontSize: "12px" }}>
                        <span className="label-text">{t('CompanyFilters.resourceLabel')}: </span>
                    </Tooltip>
                    {/* <ResourceSelect
                        value={resourceId}
                        onChange={handleResourceChange}
                        placeholder={t('CompanyFilters.resourcePlaceholder')}
                        style={{ width: 250 }}
                    /> */}
                </Col>

                <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6} className='validation-filters-col'>
                    <Tooltip title={t('CompanyFilters.companyTooltip')} overlayStyle={{ fontSize: "12px" }}>
                        <span className="label-text">{t('CompanyFilters.companyLabel')}: </span>
                    </Tooltip>
                    <CompanySelect
                        value={companyId}
                        onChange={handleCompanyChange}
                        placeholder={t('CompanyFilters.companyPlaceholder')}
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
    )
};

export default CompanyFilters;