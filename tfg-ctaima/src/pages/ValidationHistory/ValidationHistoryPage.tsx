// src/pages/ValidationHistory/ValidationHistoryPage.tsx

import React, { useState, useEffect } from 'react';
import { Row, Col, Switch, Typography, message } from 'antd';
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
    const [validations, setValidations] = useState<Validation[]>([]);
    const [filteredValidations, setFilteredValidations] = useState<Validation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showAllValidations, setShowAllValidations] = useState<boolean>(false);
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [selectedValidation, setSelectedValidation] = useState<Validation | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    const { user } = useAuth();

    useEffect(() => {
        fetchData();
    }, [showAllValidations]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [validationData, documentTypeData] = await Promise.all([
                getValidations(showAllValidations, user),
                getDocumentTypes(),
            ]);
            setDocumentTypes(documentTypeData);
            setFilteredValidations(validationData);
            setValidations(validationData);

        } catch (error) {
            message.error('Error al obtener datos del servidor');
        } finally {
            setLoading(false);
        }
    };

    const handleSwitchChange = (checked: boolean) => {
        setShowAllValidations(checked);
    };

    const handleFiltersChange = (filters: {
        searchText: string;
        dateRange: RangeValue;
        documentType: number | null;
        resultFilter: string | null;
    }) => {
        applyFilters(filters);
    };

    const applyFilters = (filters: {
        searchText: string;
        dateRange: RangeValue;
        documentType: number | null;
        resultFilter: string | null;

    }) => {

        const { searchText, dateRange, documentType, resultFilter } = filters;
        let data = [...validations];
        // Filtrar por texto de búsqueda en el nombre del documento
        if (searchText) {
            data = data.filter((validation) =>
                validation.document_name?.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Filtrar por rango de fechas
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

        // Filtrar por tipo de documento
        if (documentType) {
            console.log("Document type", documentType);
            console.log("Data", data);
            data = data.filter((validation) => validation.document_info.document_type === documentType);
        }

        // Filtrar por resultado
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
                <Col span={5}>
                    <div>
                        <Switch checked={showAllValidations} onChange={handleSwitchChange} />
                        <Text style={{ marginLeft: 8 }}>
                            {showAllValidations ? 'Todas las Validaciones' : 'Mis Validaciones'}
                        </Text>
                    </div>
                </Col>
                <Col span={18}>
                    <ValidationFilters
                        documentTypes={documentTypes}
                        onFiltersChange={handleFiltersChange}
                    />
                </Col>
            </Row>

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