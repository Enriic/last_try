// src/components/Filters/DashboardFilters/Filters.tsx

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

/**
 * Tipo personalizado para el rango de fechas
 * Puede ser un array con dos valores Dayjs (inicio y fin) o null
 */
type RangeValue = [Dayjs | null, Dayjs | null] | null;

// Extender las funcionalidades de dayjs para comparaciones y formato de fechas
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);

/**
 * Props para el componente Filters
 */
interface FiltersProps {
    /** Función que se ejecuta al aplicar los filtros */
    onApplyFilters: (filters: ValidationFilterOptions) => void;
    /** Función que se ejecuta al limpiar los filtros */
    onClearFilters: () => void;
}

// Desestructuración del componente DatePicker para usar RangePicker
const { RangePicker } = DatePicker;

/**
 * Componente de filtros para el dashboard
 * 
 * Permite filtrar validaciones por rango de fechas y tipo de documento,
 * con soporte para tooltips en pantallas pequeñas
 */
const Filters: React.FC<FiltersProps> = ({ onApplyFilters, onClearFilters }) => {
    // Obtener función de traducción para internacionalización
    const { t } = useTranslation();

    // Estados para los filtros seleccionados
    const [dateRange, setDateRange] = useState<RangeValue | null>(null);
    const [documentType, setDocumentType] = useState<string | number | null>(null);
    const [showTooltips, setShowTooltips] = useState(false);

    /**
     * Obtener ancho de ventana para mostrar/ocultar tooltips en pantallas pequeñas
     * Mejora la experiencia en dispositivos móviles
     */
    const { width } = useWindowSize();

    /**
     * Activar tooltips explicativos en pantallas pequeñas
     */
    useEffect(() => {
        setShowTooltips(width < 1200);
    }, [width]);

    /**
     * Maneja el cambio en el selector de rango de fechas
     * @param dates Nuevo rango de fechas seleccionado
     */
    const handleDateChange = (dates: RangeValue | null) => {
        setDateRange(dates);
    };

    /**
     * Limpia todos los filtros y notifica al componente padre
     */
    const clearFilters = () => {
        setDateRange(null);
        setDocumentType(null);
        onClearFilters();
    };

    /**
     * Maneja el cambio en el selector de tipo de documento
     * @param value ID del tipo de documento seleccionado
     */
    const handleDocumentTypeChange = (value: string | number | null) => {
        setDocumentType(value);
    };

    /**
     * Aplica los filtros seleccionados y notifica al componente padre
     * Convierte las fechas al formato esperado por la API
     */
    const applyFilters = () => {
        const filters: ValidationFilterOptions = {
            start_date: dateRange && dateRange[0] ? dateRange[0].format(DateFormat) : null,
            end_date: dateRange && dateRange[1] ? dateRange[1].format(DateFormat) : null,
            document_type: documentType,
        };
        onApplyFilters(filters);
    };

    /**
     * Renderiza la etiqueta del filtro de fecha con tooltip opcional
     * En pantallas pequeñas muestra un tooltip explicativo
     */
    const renderDateLabel = () => {
        const label = <span style={{ textAlign: 'right' }} className="dash-filter-label">{t('filters.dateLabel')}: </span>;

        return showTooltips ? (
            <Tooltip title={t('filters.dateTooltip')} overlayStyle={{ fontSize: "12px" }}>
                {label}
            </Tooltip>
        ) : label;
    };

    /**
     * Renderiza la etiqueta del filtro de tipo de documento con tooltip opcional
     * En pantallas pequeñas muestra un tooltip explicativo
     */
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
            {/* Filtro de rango de fechas */}
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

            {/* Filtro de tipo de documento */}
            <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={8} className="dash-filter-col">
                {renderDocTypeLabel()}
                <div className="filter-input-wrapper">
                    <DocumentTypeSelect
                        value={documentType?.toString() || null}
                        onChange={handleDocumentTypeChange}
                        placeholder={t('filters.documentTypePlaceholder')}
                        style={{ width: '100%' }}
                    />
                </div>
            </Col>

            {/* Botones de acción (aplicar y limpiar) */}
            <Col xs={24} sm={24} md={24} lg={24} xl={8} xxl={8} className="dash-filter-col dash-filter-buttons">
                <div className="button-container">
                    <JunoButton
                        buttonType={JunoButtonTypes.Ok}
                        type="primary"
                        onClick={applyFilters}
                    >
                        {t('common.apply')}
                    </JunoButton>
                    <JunoButton
                        buttonType={JunoButtonTypes.Cancel}
                        type="default"
                        onClick={clearFilters}
                    >
                        {t('common.clear')}
                    </JunoButton>
                </div>
            </Col>
        </Row>
    );
};

export default Filters;