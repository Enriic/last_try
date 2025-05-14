// src/components/common/SearchableSelect/ResourceSelect/ResourceSelect.tsx

import React, { useEffect, useState } from 'react';
import { debounce } from 'lodash';
import { notification } from 'antd';
import { getResourcesBySearch } from '../../../../services/resourceService';
import { Resource, EmployeeDetails, VehicleDetails } from '../../../../types';
import SearchableSelect from '../../SearchableSelect/SearchableSelect';
import { useTranslation } from 'react-i18next';

/**
 * Props para el componente ResourceSelect
 */
interface ResourceSelectProps {
    value?: string | null;
    onChange?: (value: string | null) => void;
    placeholder?: string;
    disabled?: boolean;
    style?: React.CSSProperties;
}

/**
 * Componente para seleccionar recursos con búsqueda y paginación
 * 
 * Permite buscar recursos por nombre, ID y otros campos relevantes con soporte para scroll infinito
 */
const ResourceSelect: React.FC<ResourceSelectProps> = ({ value, onChange, placeholder, style, disabled }) => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [page, setPage] = useState<number>(1);
    const [pageSize] = useState<number>(10);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');
    const { t } = useTranslation();

    /**
     * Cargar recursos al montar el componente o cambiar el término de búsqueda
     */
    useEffect(() => {
        fetchResources(1, searchValue);
    }, [searchValue]);

    /**
     * Obtiene el listado de recursos desde el servidor
     * @param pageNumber Número de página que se solicita
     * @param search Término de búsqueda opcional
     */
    const fetchResources = async (pageNumber: number, search: string) => {
        try {
            // Control de estado de carga según sea primera página o paginación
            pageNumber === 1 ? setLoading(true) : setIsLoadingMore(true);
            const data = await getResourcesBySearch(pageNumber, pageSize, search);
            const { results, count } = data;

            // Si es la primera página, reemplazar datos; si no, añadir a los existentes
            pageNumber === 1 ? setResources(results) : setResources((prevResources) => [...prevResources, ...results]);

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
        if (isLoadingMore || resources.length >= totalItems) {
            return;
        }
        const nextPage = page + 1;
        fetchResources(nextPage, searchValue);
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
     * Adapta el formato según sea un vehículo o un empleado
     * Si en futuro hay muchos mas recursos se puede hacer un switch
     */
    const renderOption = (item: Resource) => {
        if (item.resource_type === 'vehicle') {
            const vehicle = item.resource_details as VehicleDetails;
            return `${vehicle.name} - ${vehicle.registration_id}`;
        } else if (item.resource_type === 'employee') {
            const employee = item.resource_details as EmployeeDetails;
            return `${employee.first_name} ${employee.last_name} - ${employee.worker_id}`;
        }
        return 'Recurso desconocido';
    };

    /**
     * Define qué campo usar como clave única para cada opción
     */
    const keySelector = (item: Resource) => item.id;

    /**
     * Determina si hay más resultados disponibles para cargar
     */
    const hasMore = resources.length < totalItems;

    return (
        <SearchableSelect<Resource>
            data={resources}
            value={value}
            onChange={handleSelectChange}
            placeholder={placeholder}
            disabled={disabled}
            renderOption={renderOption}
            keySelector={keySelector}
            onLoadMore={handleLoadMore}
            loading={loading}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            style={style}
            onSearch={debouncedHandleSearch}
        />
    );
};

export default ResourceSelect;