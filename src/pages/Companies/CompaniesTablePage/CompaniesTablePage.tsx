// src/pages/Companies/CompaniesTablePage/CompaniesTablePage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, notification, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import JunoButton from '../../../components/common/JunoButton';
import CompanyTable from '../../../components/CompanyTable/CompanyTable';
import { getCompaniesForSelect } from '../../../services/companyService';
import { Company } from '../../../types';
import './CompaniesTablePage.less';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
import { JunoButtonTypes } from '../../../components/common/JunoButton/JunoButton.types';
import { PageContainer } from '@ant-design/pro-layout';
import CompanyUpdateModal from '../../../components/CompanyUpdateModal/CompanyUpdateModal';



const CompaniesTablePage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate(); // Hook para cambiar de ruta

    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    

    useEffect(() => {
        fetchData(1, pageSize, searchTerm);
    }, []);

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

    const debouncedSearch = useMemo(
        () =>
            debounce((value: string) => {
                setCurrentPage(1);
                fetchData(1, pageSize, value);
            }, 400),
        [pageSize]
    );

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handlePageChange = (page: number, pageSize?: number) => {
        setCurrentPage(page);
        setPageSize(pageSize || 10);
        fetchData(page, pageSize || 10, '');
    };

    const handleNewCompany = () => {
        navigate('/companies/new');
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedCompany(null);
        fetchData(currentPage, pageSize, searchTerm);
    };

    const showCompanyDetails = (company: Company): void => {
        setSelectedCompany(company);
        setIsModalVisible(true);
    }


    return (
        <PageContainer className='page-container' header={{ title: t('companies_table_page.title') }}>
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
                    <Input
                        style={{ width: '85%' }}
                        placeholder={t('companies_table_page.search_placeholder') || 'Buscar...'}
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
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
