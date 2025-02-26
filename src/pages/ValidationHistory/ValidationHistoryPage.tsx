// src/pages/ValidationHistory/ValidationHistoryPage.tsx

import React, { useState, useEffect } from 'react';
import { Row, Col, notification } from 'antd';
import ValidationTable from '../../components/ValidationTableHistory/ValidationTableHistory';
import ValidationDetailsModal from '../../components/ValidationDetailsModal/ValidationDetailsModal';
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

const ValidationHistoryPage: React.FC = () => {
    const { t } = useTranslation();

    const [validations, setValidations] = useState<Validation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedValidation, setSelectedValidation] = useState<Validation | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [filters, setFilters] = useState<ValidationFilterOptions>({});
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [totalItems, setTotalItems] = useState<number>(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (appliedFilters: ValidationFilterOptions = filters, page = currentPage, size = pageSize) => {
        try {
            setLoading(true);
            const validationResponse = await getValidations(appliedFilters, page, size);
            setValidations(validationResponse.results);
            setTotalItems(validationResponse.count);

        } catch (error) {
            notification.error({
                message: t('validationHistoryPage.fetchErrorMessage'), // Usar traducción para el mensaje
                description: t('validationHistoryPage.fetchErrorDescription'), // Usar traducción para la descripción
                duration: 3,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilters = (appliedFilters: ValidationFilterOptions) => {
        setCurrentPage(1);
        setFilters(appliedFilters);
        fetchData(appliedFilters, 1);
    };

    const handleClearFilters = () => {
        setFilters({});
        setCurrentPage(1);
        fetchData({}, 1, pageSize);
    };

    const handlePageChange = (page: number, pageSize?: number) => {
        setCurrentPage(page);
        setPageSize(pageSize || 10);
        fetchData(filters, page, pageSize || 10);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedValidation(null);
    };

    const showValidationDetails = (validation: Validation): void => {
        setSelectedValidation(validation);
        setIsModalVisible(true);
    }

    return (
        <PageContainer className='page-container' header={{
            title: t('companiesPage.title'), 
        }}>
            <Row align="middle" justify="center" style={{ marginBottom: 16 }} className='history-filter-section'>
                <Col span={24}>
                    <ValidationFilters
                        validations={validations}
                        onApplyFilters={handleApplyFilters}
                        onClearFilters={handleClearFilters}
                    />
                </Col>
            </Row>

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