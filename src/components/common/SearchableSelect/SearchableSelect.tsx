// src/components/common/SearchableSelect/SearchableSelect.tsx

import React from 'react';
import { Select, Spin } from 'antd';

const { Option } = Select;

/**
 * Props para el componente SearchableSelect
 * @template T Tipo de datos que se mostrarán en el select
 */
interface SearchableSelectProps<T> {
    data: T[];
    value?: string | null;
    onChange?: (value: string | null) => void;
    placeholder?: string;
    disabled?: boolean;
    style?: React.CSSProperties;
    /** Función que renderiza cada opción */
    renderOption: (item: T) => React.ReactNode;
    /** Función que extrae la clave única de cada item */
    keySelector: (item: T) => string;
    onSearch?: (value: string) => void;
    loading?: boolean;
    /** Función para cargar más resultados al hacer scroll */
    onLoadMore?: () => void;
    /** Indica si hay más resultados disponibles para cargar */
    hasMore?: boolean;
    /** Indica si está cargando más resultados */
    isLoadingMore?: boolean;
    dropdownStyle?: React.CSSProperties;
}

/**
 * Componente select con búsqueda y carga paginada
 * 
 * Permite buscar entre opciones con debounce automático y soporte para scroll infinito.
 * @template T Tipo de datos a mostrar en el select
 */
function SearchableSelect<T>({
    data,
    value,
    onChange,
    placeholder,
    disabled,
    style,
    renderOption,
    keySelector,
    loading,
    onSearch,
    onLoadMore,
    hasMore,
    isLoadingMore,
    dropdownStyle,
}: SearchableSelectProps<T>) {

    /**
     * Maneja la acción de búsqueda
     */
    const handleSearch = (value: string) => {
        if (onSearch) {
            onSearch(value);
        }
    };

    /**
     * Maneja el cambio de valor seleccionado
     */
    const handleChange = (valueKey: string | null) => {
        if (onChange) {
            onChange(valueKey);
        }
    };

    /**
     * Maneja la limpieza del campo
     */
    const onClear = () => {
        if (onChange) {
            onChange(null);
        }
    };

    /**
     * Genera las opciones a mostrar en el desplegable
     */
    const options = data.map((item) => (
        <Option key={keySelector(item)} value={keySelector(item)}>
            {renderOption(item)}
        </Option>
    ));

    /**
     * Maneja el evento de scroll para carga infinita
     */
    const handlePopupScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        // Detecta cuando el scroll está cerca del final
        if (
            onLoadMore && 
            hasMore && 
            !isLoadingMore &&
            target.scrollTop + target.clientHeight >= target.scrollHeight - 20
        ) {
            onLoadMore();
        }
    };

    return (
        <Select
            showSearch
            placeholder={placeholder}
            value={value ? value : null}
            onChange={handleChange}
            onSearch={handleSearch}
            filterOption={false} // Deshabilita filtrado automático para permitir búsqueda en servidor
            allowClear
            notFoundContent={loading ? <Spin size="small" /> : null}
            disabled={disabled}
            onClear={onClear}
            style={style}
            onPopupScroll={handlePopupScroll}
            dropdownStyle={dropdownStyle ? dropdownStyle : { overflowY: 'scroll' }}
        >
            {options}
        </Select>
    );
}

export default SearchableSelect;


