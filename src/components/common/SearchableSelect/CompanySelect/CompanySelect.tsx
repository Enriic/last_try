// src/components/common/SearchableSelect/CompanySelect/CompanySelect.tsx

import React, { useEffect, useState } from 'react';
import { notification } from 'antd';
import { getCompaniesForSelect } from '../../../../services/companyService';
import { Company } from '../../../../types';
import SearchableSelect from '../SearchableSelect';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';

/**
 * Props para el componente CompanySelect
 */
interface CompanySelectProps {
    value?: string | null;
    onChange?: (value: string | null) => void;
    placeholder?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
}

/**
 * Componente para seleccionar empresas con búsqueda y paginación
 * 
 * Permite buscar empresas por nombre y cargar más resultados mediante scroll infinito
 */
const CompanySelect: React.FC<CompanySelectProps> = ({ value, onChange, placeholder, style, disabled }) => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [page, setPage] = useState<number>(1);
    const [pageSize] = useState<number>(10);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');
    const { t } = useTranslation();

    /**
     * Cargar compañías al cambiar el término de búsqueda
     */
    useEffect(() => {
        fetchCompanies(1, searchValue);
    }, [searchValue]);

    /**
     * Obtiene el listado de compañías desde el servidor
     * @param pageNumber Número de página que se solicita
     * @param search Término de búsqueda opcional
     */
    const fetchCompanies = async (pageNumber: number, search: string) => {
        try {
            // Control de estado de carga según sea primera página o paginación
            pageNumber === 1 ? setLoading(true) : setIsLoadingMore(true);


            const data = await getCompaniesForSelect(pageNumber, pageSize, search);
            const { results, count } = data;

            // Si es la primera página, reemplazar datos; si no, añadir a los existentes
            pageNumber === 1 ? setCompanies(results) : setCompanies((prevCompanies) => [...prevCompanies, ...results]);
            setTotalItems(count);
            setPage(pageNumber);

        } catch (e) {
            notification.error({
                message: t('notification.error.title'),
                description: t('notification.error.description'),
                duration: 3,
            });
        } finally {
            // Restablecer estado de carga
            pageNumber === 1 ? setLoading(false) : setIsLoadingMore(false);
        }
    };

    /**
     * Solicita la siguiente página de resultados cuando se detecta scroll hasta el final
     */
    const handleLoadMore = () => {
        if (isLoadingMore || companies.length >= totalItems) {
            return;
        }
        const nextPage = page + 1;
        fetchCompanies(nextPage, searchValue);
    };

    /**
     * Maneja la búsqueda con debounce para evitar peticiones excesivas
     */
    const debouncedHandleSearch = debounce((value: string) => {
        setSearchValue(value);
        setPage(1); // Reiniciar a primera página cuando hay nueva búsqueda
    }, 400);

    /**
     * Maneja el cambio de valor seleccionado
     */
    const handleSelectChange = (value: string | null) => {
        if (onChange) {
            onChange(value);
        }
        // Si se borra la selección, limpiar búsqueda y reiniciar paginación
        if (!value) {
            setSearchValue('');
            setPage(1);
        }
    };

    /**
     * Define cómo se visualiza cada opción en el desplegable
     */
    const renderOption = (item: Company) => `${item.company_name} - ${item.company_id}`;

    /**
     * Define qué campo usar como clave única para cada opción
     */
    const keySelector = (item: Company) => item.id;

    /**
     * Determina si hay más resultados disponibles para cargar
     */
    const hasMore = companies.length < totalItems;

    return (
        <SearchableSelect<Company>
            data={companies}
            value={value}
            onChange={handleSelectChange}
            placeholder={placeholder}
            style={style}
            renderOption={renderOption}
            keySelector={keySelector}
            onLoadMore={handleLoadMore}
            loading={loading}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onSearch={debouncedHandleSearch}
            disabled={disabled}
        />
    );
};

export default CompanySelect;