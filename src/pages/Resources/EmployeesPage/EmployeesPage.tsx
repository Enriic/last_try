// src/pages/Employees/EmployeePage/EmployeePage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, notification, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import JunoButton from '../../../components/common/JunoButton';
import EmployeeTable from '../../../components/Tables/EmployeeTable/EmployeeTable';
import { getResourcesByType } from '../../../services/resourceService';
import { Resource } from '../../../types';
import './EmployeesPage.less';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
import { JunoButtonTypes } from '../../../components/common/JunoButton/JunoButton.types';
import { PageContainer } from '@ant-design/pro-layout';
import EmployeeUpdateModal from '../../../components/Modals/EmployeeUpdateModal/EmployeeUpdateModal';

/**
 * Página para mostrar y gestionar empleados
 */
const EmployeePage: React.FC = () => {
    /* Hook para acceder a las funciones de traducción */
    const { t } = useTranslation();
    /* Hook para la navegación entre páginas */
    const navigate = useNavigate();

    /* Estado para almacenar la lista de empleados */
    const [employees, setEmployees] = useState<Resource[]>([]);
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
    /* Estado para el empleado seleccionado */
    const [selectedEmployee, setSelectedEmployee] = useState<Resource | null>(null);

    /* Efecto para cargar los datos iniciales */
    useEffect(() => {
        fetchData(1, pageSize, searchTerm);
    }, []);

    /**
     * Función para obtener los datos de los empleados
     * @param pageNumber - Número de página actual
     * @param pageSize - Tamaño de página
     * @param search - Término de búsqueda
     */
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

    /**
     * Función de búsqueda con debounce para evitar demasiadas peticiones
     */
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

    /**
     * Manejador para el cambio en el campo de búsqueda
     */
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    /**
     * Manejador para el cambio de página
     */
    const handlePageChange = (page: number, pageSize?: number) => {
        setCurrentPage(page);
        setPageSize(pageSize || 10);
        fetchData(page, pageSize || 10, searchTerm);
    };

    /**
     * Manejador para crear un nuevo empleado
     */
    const handleNewEmployee = () => {
        navigate('/resources/employees/new');
    };

    /**
     * Manejador para cerrar el modal de actualización
     */
    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedEmployee(null);
        fetchData(currentPage, pageSize, searchTerm);
    };

    /**
     * Manejador para mostrar los detalles de un empleado
     */
    const showEmployeeDetails = (employee: Resource): void => {
        setSelectedEmployee(employee);
        setIsModalVisible(true);
    };

    return (
        <PageContainer className='page-container' header={{ title: t('employees_table_page.title') }}>
            {/* Sección de búsqueda y botón para crear nuevo empleado */}
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
                    {/* Campo de búsqueda */}
                    <Input
                        style={{ width: '85%' }}
                        placeholder={t('employees_table_page.search_placeholder') || 'Buscar...'}
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    {/* Botón para crear nuevo empleado */}
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

            {/* Tabla de empleados */}
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

            {/* Modal para actualizar empleado */}
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