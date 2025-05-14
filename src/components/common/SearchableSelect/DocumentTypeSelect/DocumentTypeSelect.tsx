// src/components/common/SearchableSelect/DocumentTypeSelect/DocumentTypeSelect.tsx

import React, { useEffect, useState } from 'react';
import { notification } from 'antd';
import { getDocumentTypes } from '../../../../services/documentService';
import { DocumentType } from '../../../../types';
import SearchableSelect from '../SearchableSelect';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';

/**
 * Props para el componente DocumentTypeSelect
 */
interface DocumentTypeSelectProps {
    value?: string | null;
    onChange?: (value: string | null | number) => void;
    placeholder?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
}

/**
 * Componente para seleccionar tipos de documentos con búsqueda y carga paginada
 * 
 * Permite buscar tipos de documentos por nombre y cargar más resultados mediante scroll infinito
 */
const DocumentTypeSelect: React.FC<DocumentTypeSelectProps> = ({ value, onChange, disabled, placeholder, style }) => {
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [page, setPage] = useState<number>(1);
    const [pageSize] = useState<number>(10);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');
    const { t } = useTranslation();

    /**
     * Cargar tipos de documentos al montar el componente o cambiar el término de búsqueda
     */
    useEffect(() => {
        fetchDocumentTypes(1, searchValue);
    }, [searchValue]);

    /**
     * Obtiene el listado de tipos de documentos desde el servidor
     * @param pageNumber Número de página que se solicita
     * @param search Término de búsqueda opcional
     */
    const fetchDocumentTypes = async (pageNumber: number, search: string) => {
        try {
            // Control de estado de carga según sea primera página o paginación
            pageNumber === 1 ? setLoading(true) : setIsLoadingMore(true);

            const data = await getDocumentTypes(pageNumber, pageSize, search);
            const { results, count } = data;

            // Si es la primera página, reemplazar datos; si no, añadir a los existentes
            pageNumber === 1 ? setDocumentTypes(results) : setDocumentTypes((prevDocumentTypes) => [...prevDocumentTypes, ...results]);

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
        if (isLoadingMore || documentTypes.length >= totalItems) {
            return;
        }
        const nextPage = page + 1;
        fetchDocumentTypes(nextPage, searchValue);
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
    const renderOption = (item: DocumentType) => item.name;

    /**
     * Define qué campo usar como clave única para cada opción
     * Convierte el ID a string para compatibilidad con el Select
     */
    const keySelector = (item: DocumentType) => item.id.toString();

    /**
     * Determina si hay más resultados disponibles para cargar
     */
    const hasMore = documentTypes.length < totalItems;

    return (
        <SearchableSelect<DocumentType>
            data={documentTypes}
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

export default DocumentTypeSelect;