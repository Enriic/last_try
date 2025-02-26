// src/pages/Employees/EmployeePage/EmployeePage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, notification, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import JunoButton from '../../../components/common/JunoButton';
import EmployeeTable from '../../../components/EmployeeTable/EmployeeTable';
import { getResourcesByType } from '../../../services/resourceService';
import { Resource } from '../../../types';
import './EmployeesPage.less';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
import { JunoButtonTypes } from '../../../components/common/JunoButton/JunoButton.types';
import { PageContainer } from '@ant-design/pro-layout';
import EmployeeUpdateModal from '../../../components/EmployeeUpdateModal/EmployeeUpdateModal';

const EmployeePage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [employees, setEmployees] = useState<Resource[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Resource | null>(null);

    useEffect(() => {
        fetchData(1, pageSize, searchTerm);
    }, []);

    const fetchData = async (pageNumber: number, pageSize: number, search: string) => {
        try {
            setLoading(true);
            const data = await getResourcesByType('employees', pageNumber, pageSize, search);
            const { results, count } = data;
            setEmployees(results);
            setTotalItems(count);
        } catch (error) {
            notification.error({
                message: t('¡Ups! Algo salió mal'),
                description: t('Ocurrió un error al obtener los empleados'),
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
        fetchData(page, pageSize || 10, searchTerm);
    };

    const handleNewEmployee = () => {
        navigate('/resources/employees/new');
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedEmployee(null);
        fetchData(currentPage, pageSize, searchTerm);
    };

    const showEmployeeDetails = (employee: Resource): void => {
        setSelectedEmployee(employee);
        setIsModalVisible(true);
    };

    return (
        <PageContainer className='page-container' header={{ title: t('employees_table_page.title') }}>
            <Row className="employee-search-section">
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
                        placeholder={t('employees_table_page.search_placeholder') || 'Buscar...'}
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <JunoButton
                        style={{ width: '15%' }}
                        buttonType={JunoButtonTypes.Add}
                        type="primary"
                        onClick={handleNewEmployee}
                    >
                        {t('employees_table_page.new_employee') || 'Nuevo'}
                    </JunoButton>
                </Col>
            </Row>

            <EmployeeTable
                employees={employees}
                loading={loading}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: totalItems,
                    onChange: handlePageChange,
                }}
                onViewDetails={showEmployeeDetails}
            />

            {isModalVisible && selectedEmployee && (
                <EmployeeUpdateModal
                    employee={selectedEmployee}
                    visible={isModalVisible}
                    onClose={handleModalClose}
                />
            )}
        </PageContainer>
    );
};

export default EmployeePage;
