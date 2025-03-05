// src/pages/ValidationHistory/ValidationHistoryPage.tsx

import React, { useState, useEffect } from 'react';
import { Row, Col, notification } from 'antd';
import ValidationTable from '../../components/Tables/ValidationTableHistory/ValidationTableHistory';
import ValidationDetailsModal from '../../components/Modals/ValidationDetailsModal/ValidationDetailsModal';
import ValidationFilters from '../../components/Filters/ValidationFilters/ValidationFilters';
import { getValidations } from '../../services/validationService';
import { Validation } from '../../types';
import { ValidationFilterOptions } from '../../types/filters';
import dayjs from 'dayjs';
import './ValidationHistory.less';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useTranslation } from 'react-i18next';
import { PageContainer } from '@ant-design/pro-layout';

// Añadir plugins a dayjs
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);

/**
 * Página para mostrar el historial de validaciones
 */
const ValidationHistoryPage: React.FC = () => {
    /* Hook para acceder a las funciones de traducción */
    const { t } = useTranslation();

    /* Estado para almacenar la lista de validaciones */
    const [validations, setValidations] = useState<Validation[]>([]);
    /* Estado para controlar la carga de datos */
    const [loading, setLoading] = useState<boolean>(true);
    /* Estado para la validación seleccionada */
    const [selectedValidation, setSelectedValidation] = useState<Validation | null>(null);
    /* Estado para la visibilidad del modal de detalles */
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    /* Estado para los filtros aplicados */
    const [filters, setFilters] = useState<ValidationFilterOptions>({});
    /* Estado para la página actual de la paginación */
    const [currentPage, setCurrentPage] = useState<number>(1);
    /* Estado para el tamaño de página */
    const [pageSize, setPageSize] = useState<number>(10);
    /* Estado para el número total de elementos */
    const [totalItems, setTotalItems] = useState<number>(0);

    /* Efecto para cargar los datos iniciales */
    useEffect(() => {
        fetchData();
    }, []);

    /**
     * Función para obtener los datos de las validaciones
     * @param appliedFilters - Filtros a aplicar en la consulta
     * @param page - Número de página
     * @param size - Tamaño de página
     */
    const fetchData = async (appliedFilters: ValidationFilterOptions = filters, page = currentPage, size = pageSize) => {
        try {
            setLoading(true);
            const validationResponse = await getValidations(appliedFilters, page, size);
            setValidations(validationResponse.results);
            setTotalItems(validationResponse.count);
        } catch (error) {
            notification.error({
                message: t('validationHistoryPage.fetchErrorMessage'),
                description: t('validationHistoryPage.fetchErrorDescription'),
                duration: 3,
            });
        } finally {
            setLoading(false);
        }
    };

    /**
     * Manejador para aplicar filtros
     * @param appliedFilters - Filtros seleccionados por el usuario
     */
    const handleApplyFilters = (appliedFilters: ValidationFilterOptions) => {
        setCurrentPage(1);
        setFilters(appliedFilters);
        fetchData(appliedFilters, 1);
    };

    /**
     * Manejador para limpiar todos los filtros
     */
    const handleClearFilters = () => {
        setFilters({});
        setCurrentPage(1);
        fetchData({}, 1, pageSize);
    };

    /**
     * Manejador para el cambio de página
     * @param page - Nueva página seleccionada
     * @param pageSize - Nuevo tamaño de página
     */
    const handlePageChange = (page: number, pageSize?: number) => {
        setCurrentPage(page);
        setPageSize(pageSize || 10);
        fetchData(filters, page, pageSize || 10);
    };

    /**
     * Manejador para cerrar el modal de detalles
     */
    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedValidation(null);
    };

    /**
     * Manejador para mostrar los detalles de una validación
     * @param validation - Validación seleccionada
     */
    const showValidationDetails = (validation: Validation): void => {
        setSelectedValidation(validation);
        setIsModalVisible(true);
    }

    return (
        <PageContainer className='page-container' header={{
            title: t('companiesPage.title'),
        }}>
            {/* Sección de filtros */}
            <Row align="middle" justify="center" style={{ marginBottom: 16 }} className='history-filter-section'>
                <Col span={24}>
                    <ValidationFilters
                        onApplyFilters={handleApplyFilters}
                        onClearFilters={handleClearFilters}
                    />
                </Col>
            </Row>

            {/* Tabla de validaciones */}
            <ValidationTable
                validations={validations}
                loading={loading}
                onViewDetails={showValidationDetails}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: totalItems,
                    onChange: handlePageChange,
                }}
            />

            {/* Modal para los detalles de la validación */}
            {selectedValidation && (
                <ValidationDetailsModal
                    visible={isModalVisible}
                    validation={selectedValidation}
                    onClose={handleModalClose}
                />
            )}
        </PageContainer>
    );
};

export default ValidationHistoryPage;