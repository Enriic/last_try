// src/components/common/SearchableSelect/ValidationSelect/ValidationSelect.tsx
import React, { useEffect, useState } from 'react';
import { notification, Spin } from 'antd';
import { getValidationsForSelect } from '../../../../services/validationService';
import { Validation } from '../../../../types';
import SearchableSelect from '../SearchableSelect';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';

/**
 * Props para el componente ValidationSelect
 */
interface ValidationSelectProps {
    value?: string | null;
    onChange?: (value: string | null) => void;
    placeholder?: string;
    style?: React.CSSProperties;
}

/**
 * Componente para seleccionar validaciones con búsqueda y paginación
 * 
 * Permite buscar validaciones por ID con soporte para carga paginada mediante scroll infinito
 */
const ValidationSelect: React.FC<ValidationSelectProps> = ({ value, onChange, placeholder, style }) => {
    const [validations, setValidations] = useState<Validation[]>([]);
    const [page, setPage] = useState<number>(1);
    const [pageSize] = useState<number>(10);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');
    const { t } = useTranslation();

    /**
     * Cargar validaciones al montar el componente o cambiar el término de búsqueda
     */
    useEffect(() => {
        fetchValidations(page, searchValue);
    }, [searchValue]);

    /**
     * Obtiene el listado de validaciones desde el servidor
     * @param pageNumber Número de página que se solicita
     * @param search Término de búsqueda opcional
     */
    const fetchValidations = async (pageNumber: number, search: string) => {
        try {
            // Control de estado de carga según sea primera página o paginación
            pageNumber === 1 ? setLoading(true) : setIsLoadingMore(true);
            const data = await getValidationsForSelect(pageNumber, pageSize, search);
            const { results, count } = data;

            // Si es la primera página, reemplazar datos; si no, añadir a los existentes
            pageNumber === 1 ? setValidations(results) : setValidations((prevValidations) => [...prevValidations, ...results]);
            setTotalItems(count);
            setPage(pageNumber);

        } catch (error) {
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
        if (isLoadingMore || validations.length >= totalItems) {
            return;
        }
        const nextPage = page + 1;
        fetchValidations(nextPage, searchValue);
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
     * En este caso, muestra el ID de la validación
     */
    const renderOption = (item: Validation) => item.id;

    /**
     * Define qué campo usar como clave única para cada opción
     */
    const keySelector = (item: Validation) => item.id;

    /**
     * Determina si hay más resultados disponibles para cargar
     */
    const hasMore = validations.length < totalItems;

    return (
        <SearchableSelect<Validation>
            data={validations}
            value={value}
            onChange={handleSelectChange}
            placeholder={placeholder}
            style={style}
            loading={loading}
            onLoadMore={handleLoadMore}
            renderOption={renderOption}
            keySelector={keySelector}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onSearch={debouncedHandleSearch}
        />
    );
};

export default ValidationSelect;