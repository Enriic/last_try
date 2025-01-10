// src/pages/ValidationHistory/ValidationHistoryPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Switch, Typography, notification } from 'antd';
import ValidationFilters from '../../components/Filters/ValidationFilters/ValidationFilters';
import ValidationTable from '../../components/ValidationTableHistory/ValidationTableHistory';
import ValidationDetailsModal from '../../components/ValidationDetailsModal/ValidationDetailsModal';
import { useAuth } from '../../context/AuthContext';
import { getDocumentTypes } from '../../services/documentService';
import { getValidations } from '../../services/validationService';
import { Validation, DocumentType } from '../../types';
import dayjs, { Dayjs } from 'dayjs';
import './ValidationHistory.less';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Añadir plugins a dayjs
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);

// Tipo RangeValue
type RangeValue = [Dayjs | null, Dayjs | null] | null;

const { Text } = Typography;

const ValidationHistoryPage: React.FC = () => {
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [validations, setValidations] = useState<Validation[]>([]);
    const [filteredValidations, setFilteredValidations] = useState<Validation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showAllValidations, setShowAllValidations] = useState<boolean>(true);
    const [selectedValidation, setSelectedValidation] = useState<Validation | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    
    const { user } = useAuth();

    useEffect(() => {
        fetchData();
    }, [showAllValidations]); // Dependemos de 'showAllValidations' para refrescar los datos

    const fetchData = async () => {
        try {
            console.log('Fetching data');
            setLoading(true);
            const validationData = await getValidations(showAllValidations, user);
            const documentTypes = await getDocumentTypes();
            setValidations(validationData);
            setFilteredValidations(validationData);
            setDocumentTypes(documentTypes);
        } catch (error) {
            notification.error({
                message: 'Upps! Something went wrong',
                description: 'An error occurred while fetching the validations',
                duration: 3,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSwitchChange = (checked: boolean) => {
        setShowAllValidations(checked);
    };

    const handleFiltersChange = useCallback((filters: {
        searchTextValId: string;
        searchTextDocName: string;
        dateRange: RangeValue;
        documentType: number | null;
        resultFilter: string | null;
    }) => {
        applyFilters(filters);
    }, [validations]);

    const applyFilters = (filters: {
        searchTextDocName: string;
        searchTextValId: string;
        dateRange: RangeValue;
        documentType: number | null;
        resultFilter: string | null;
    }) => {
        const { searchTextDocName, searchTextValId, dateRange, documentType, resultFilter } = filters;
        let data = [...validations];

        console.log('Applying filters');
        if (searchTextDocName) {
            data = data.filter((validation) =>
                validation.document_info?.name?.toLowerCase().includes(searchTextDocName.toLowerCase())
            );
        }

        if (searchTextValId) {
            data = data.filter((validation) =>
                validation.id.toLowerCase().includes(searchTextValId.toLowerCase())
            );
        }

        if (dateRange) {
            const [start, end] = dateRange;
            if (start && end) {
                data = data.filter((validation) => {
                    const validationTimestamp = dayjs(validation.timestamp);
                    if (!validationTimestamp.isValid()) {
                        return false;
                    }
                    return (
                        start.isSameOrBefore(validationTimestamp, 'day') &&
                        end.isSameOrAfter(validationTimestamp, 'day')
                    );
                });
            }
        }

        if (documentType !== null && documentType !== undefined) {
            data = data.filter((validation) => validation.document_info.document_type_info.id === documentType);
        }

        if (resultFilter) {
            data = data.filter((validation) => validation.status === resultFilter);
        }
        setFilteredValidations(data);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedValidation(null);
    };

    function showValidationDetails(validation: Validation): void {
        setSelectedValidation(validation);
        setIsModalVisible(true);
    }

    return (
        <div style={{ padding: 24 }}>
            <Row align="middle" justify="space-between" style={{ marginBottom: 16 }} className='history-filter-section'>
                <Col span={24}>
                    <ValidationFilters
                        documentTypes={documentTypes}
                        onFiltersChange={handleFiltersChange}
                    />
                </Col>
            </Row>
            <div className="switch-history-filter">
                <Switch checked={showAllValidations} onChange={handleSwitchChange} size='small' />
                <Text style={{ marginLeft: 8 }}>
                    {showAllValidations ? 'Todas las Validaciones' : 'Mis Validaciones'}
                </Text>
            </div>
            <ValidationTable
                validations={filteredValidations}
                loading={loading}
                onViewDetails={showValidationDetails}
            />

            {/* Modal para los detalles de la validación */}
            {selectedValidation && (
                <ValidationDetailsModal
                    visible={isModalVisible}
                    validation={selectedValidation}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
};

export default ValidationHistoryPage;