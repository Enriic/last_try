// src/components/Filters/ValidationFilters/ValidationFilters.tsx

import React, { useState } from 'react';
import { Row, Col, DatePicker, Select, Tooltip, Button } from 'antd';
import { Validation } from '../../../types';
import { ValidationFilterOptions } from '../../../types/filters.ts';
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
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { DateFormat } from '../../../types/format.ts';

// Extender las funcionalidades de dayjs para comparaciones y formato de fechas
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);

/**
 * Tipo personalizado para el rango de fechas
 * Puede ser un array con dos valores Dayjs (inicio y fin) o null
 */
type RangeValue = [Dayjs | null, Dayjs | null] | null;

const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * Props para el componente ValidationFilters
 */
interface ValidationFiltersProps {
    onApplyFilters: (filters: ValidationFilterOptions) => void;
    onClearFilters: () => void;
}

/**
 * Componente de filtros avanzados para la pantalla de validaciones
 * 
 * Permite filtrar validaciones por múltiples criterios como documento, ID de validación,
 * rango de fechas, tipo de documento, estado, compañía y recurso asociado.
 * Implementa un diseño expandible para optimizar el espacio en pantalla.
 */
const ValidationFilters: React.FC<ValidationFiltersProps> = ({ onApplyFilters, onClearFilters }) => {
    const { t } = useTranslation();

    // Estados para los diferentes filtros
    const [documentId, setDocumentId] = useState<string | null>(null);
    const [validationId, setValidationId] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<RangeValue>(null);
    const [documentType, setDocumentType] = useState<number | string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [resourceId, setResourceId] = useState<string | null>(null);

    // Estado para controlar la expansión/colapso de filtros adicionales
    const [isExpanded, setIsExpanded] = useState(false);

    /**
     * Recopila todos los filtros aplicados y los pasa al componente padre
     * Convierte las fechas al formato esperado por la API
     */
    const applyFilters = () => {
        const filters: ValidationFilterOptions = {
            document_id: documentId,
            validation_id: validationId,
            start_date: dateRange && dateRange[0] ? dateRange[0].format(DateFormat) : null,
            end_date: dateRange && dateRange[1] ? dateRange[1].format(DateFormat) : null,
            document_type: documentType,
            status: status,
            company_id: companyId,
            resource_id: resourceId,
        };
        onApplyFilters(filters);
    };

    /**
     * Restablece todos los filtros a su estado inicial y notifica al componente padre
     */
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

    /**
     * Maneja el cambio en el selector de documento
     * @param value ID del documento seleccionado
     */
    const handleDocumentIdChange = (value: string | null) => {
        setDocumentId(value);
    };

    /**
     * Maneja el cambio en el selector de validación
     * @param value ID de la validación seleccionada
     */
    const handleValidationIdChange = (value: string | null) => {
        setValidationId(value);
    };

    /**
     * Maneja el cambio en el selector de rango de fechas
     * @param dates Nuevo rango de fechas seleccionado
     */
    const handleDateChange = (dates: RangeValue) => {
        setDateRange(dates);
    };

    /**
     * Maneja el cambio en el selector de tipo de documento
     * @param value ID del tipo de documento seleccionado
     */
    const handleDocumentTypeChange = (value: number | string | null) => {
        setDocumentType(value);
    };

    /**
     * Maneja el cambio en el selector de estado de validación
     * @param value Estado seleccionado (success/failure)
     */
    const handleStatusChange = (value: string | null) => {
        setStatus(value);
    };

    /**
     * Maneja el cambio en el selector de compañía
     * @param value ID de la compañía seleccionada
     */
    const handleCompanyChange = (value: string | null) => {
        setCompanyId(value);
    };

    /**
     * Maneja el cambio en el selector de recurso
     * @param value ID del recurso seleccionado
     */
    const handleResourceChange = (value: string | null) => {
        setResourceId(value);
    };

    /**
     * Alterna entre mostrar/ocultar los filtros adicionales
     */
    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className='validation-filters-container'>
            <Row gutter={16} className='validation-filters-row' align='middle' justify='start'>
                {/* Filtros principales - siempre visibles */}
                <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6} className='validation-filters-col'>
                    {/* Selector de documento */}
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
                    {/* Selector de ID de validación */}
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
                    {/* Selector de rango de fechas */}
                    <Tooltip title={t('validationFilters.dateTooltip')} overlayStyle={{ fontSize: "12px" }}>
                        <span className="label-text">{t('validationFilters.dateLabel')}: </span>
                    </Tooltip>
                    <RangePicker
                        onChange={handleDateChange}
                        style={{ width: 250 }}
                        value={dateRange}
                    />
                </Col>

                {/* Filtros adicionales - visibles solo cuando está expandido */}
                {isExpanded && (
                    <>
                        <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6} className='validation-filters-col'>
                            {/* Selector de tipo de documento */}
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
                            {/* Selector de estado de validación (éxito/fallo) */}
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
                            {/* Selector de recurso asociado */}
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
                            {/* Selector de compañía */}
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
                    </>
                )}

                {/* Sección de botones - colocación responsiva */}
                <Col xs={24} sm={24} md={24} lg={24} xl={8} xxl={6} className='validation-filters-col validation-filters-buttons'>
                    <div className="filters-actions">
                        {/* Botón expandir/colapsar - Prioridad si solo cabe uno */}
                        <Button
                            type="link"
                            onClick={toggleExpanded}
                            icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
                            className="expand-button"
                        >
                            {isExpanded ? t('common.collapse') || 'Collapse' : t('common.expand') || 'Expand'}
                        </Button>

                        {/* Botones aplicar y limpiar */}
                        <div className="action-buttons">
                            <JunoButton buttonType={JunoButtonTypes.Ok} type='primary' onClick={applyFilters}>
                                {t('common.apply')}
                            </JunoButton>
                            <JunoButton buttonType={JunoButtonTypes.Cancel} type='default' onClick={clearFilters}>
                                {t('common.clear')}
                            </JunoButton>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default ValidationFilters;