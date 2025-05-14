// src/pages/Companies/CompaniesTablePage/CompaniesTablePage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, notification, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import JunoButton from '../../../components/common/JunoButton';
import CompanyTable from '../../../components/Tables/CompanyTable/CompanyTable';
import { getCompaniesForSelect } from '../../../services/companyService';
import { Company } from '../../../types';
import './CompaniesTablePage.less';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
import { JunoButtonTypes } from '../../../components/common/JunoButton/JunoButton.types';
import { PageContainer } from '@ant-design/pro-layout';
import CompanyUpdateModal from '../../../components/Modals/CompanyUpdateModal/CompanyUpdateModal';

/**
 * Página para mostrar y gestionar la tabla de compañías
 */
const CompaniesTablePage: React.FC = () => {
    /* Hook para acceder a las funciones de traducción */
    const { t } = useTranslation();
    /* Hook para la navegación entre páginas */
    const navigate = useNavigate();

    /* Estado para almacenar la lista de compañías */
    const [companies, setCompanies] = useState<Company[]>([]);
    /* Estado para controlar la carga de datos */
    const [loading, setLoading] = useState<boolean>(true);
    /* Estado para la página actual de la paginación */
    const [currentPage, setCurrentPage] = useState<number>(1);
    /* Estado para el tamaño de página */
    const [pageSize, setPageSize] = useState<number>(10);
    /* Estado para el número total de elementos */
    const [totalItems, setTotalItems] = useState<number>(0);
    /* Estado para el término de búsqueda */
    const [searchTerm, setSearchTerm] = useState<string>('');
    /* Estado para la visibilidad del modal de actualización */
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    /* Estado para la compañía seleccionada */
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

    /* Efecto para cargar los datos iniciales */
    useEffect(() => {
        fetchData(1, pageSize, searchTerm);
    }, []);

    /* Función para obtener los datos de las compañías */
    const fetchData = async (pageNumber: number, pageSize: number, search: string) => {
        try {
            setLoading(true);
            const data = await getCompaniesForSelect(pageNumber, pageSize, search);
            const { results, count } = data;
            setCompanies(results);
            setTotalItems(count);
        } catch (error) {
            notification.error({
                message: '¡Ups! Algo salió mal',
                description: 'Ocurrió un error al obtener las compañías',
                duration: 3,
            });
        } finally {
            setLoading(false);
        }
    };

    /* Función de búsqueda con debounce para evitar demasiadas peticiones */
    const debouncedSearch = useMemo(
        () =>
            debounce((value: string) => {
                setCurrentPage(1);
                fetchData(1, pageSize, value);
            }, 400),
        [pageSize]
    );

    /* Efecto para limpiar el debounce al desmontar el componente */
    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    /* Manejador para el cambio en el campo de búsqueda */
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    /* Manejador para el cambio de página */
    const handlePageChange = (page: number, pageSize?: number) => {
        setCurrentPage(page);
        setPageSize(pageSize || 10);
        fetchData(page, pageSize || 10, '');
    };

    /* Manejador para crear una nueva compañía */
    const handleNewCompany = () => {
        navigate('/companies/new');
    };

    /* Manejador para cerrar el modal de actualización */
    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedCompany(null);
        fetchData(currentPage, pageSize, searchTerm);
    };

    /* Manejador para mostrar los detalles de una compañía */
    const showCompanyDetails = (company: Company): void => {
        setSelectedCompany(company);
        setIsModalVisible(true);
    }

    return (
        <PageContainer className='page-container' header={{ title: t('companies_table_page.title') }}>
            {/* Sección de búsqueda y botón para crear nueva compañía */}
            <Row className='company-search-section'>
                <Col
                    style={{
                        maxWidth: '500px',
                        textAlign: 'left',
                        display: 'flex',
                        justifyContent: 'start',
                        gap: '16px',
                    }}
                    span={24}
                >
                    {/* Campo de búsqueda */}
                    <Input
                        style={{ width: '85%' }}
                        placeholder={t('companies_table_page.search_placeholder') || 'Buscar...'}
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    {/* Botón para crear nueva compañía */}
                    <JunoButton
                        style={{ width: '15%' }}
                        buttonType={JunoButtonTypes.Add}
                        type="primary"
                        onClick={handleNewCompany}
                    >
                        {t('companies_table_page.new_company') || 'New'}
                    </JunoButton>
                </Col>
            </Row>

            {/* Tabla de compañías */}
            <CompanyTable
                companies={companies}
                loading={loading}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: totalItems,
                    onChange: handlePageChange,
                }}
                onViewDetails={showCompanyDetails}
            />

            {/* Modal para actualizar compañía */}
            {isModalVisible && selectedCompany && (
                <CompanyUpdateModal
                    company={selectedCompany}
                    visible={isModalVisible}
                    onClose={handleModalClose}
                />
            )}
        </PageContainer>
    );
};

export default CompaniesTablePage;