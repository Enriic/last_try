// src/components/SearchableSelect/SearchableSelect.tsx

import React, { useState } from 'react';
import { Select } from 'antd';

const { Option, OptGroup } = Select;

interface SearchableSelectProps<T> {
    data: T[];
    value?: string | null;
    onChange?: (value: string | null) => void;
    placeholder?: string;
    allowClear?: boolean;
    style?: React.CSSProperties;
    filterOption: (input: string, option: T) => boolean;
    renderOption: (item: T) => React.ReactNode;
    keySelector: (item: T) => string; // Función para obtener el key de cada opción
    groupBy?: (item: T) => string; // Función opcional para agrupar las opciones
    renderGroupTitle?: (group: string) => React.ReactNode; // Función opcional para renderizar el título del grupo
}

function SearchableSelect<T>({
    data,
    value,
    onChange,
    placeholder,
    style,
    filterOption,
    renderOption,
    keySelector,
    groupBy,
    renderGroupTitle,
}: SearchableSelectProps<T>) {
    const [searchValue, setSearchValue] = useState('');

    // Filtrar los datos según el valor de búsqueda
    const filteredData = data.filter((item) => filterOption(searchValue, item));

    // Mapear los datos a opciones del Select
    let options;

    if (groupBy && renderGroupTitle) {
        // Agrupar las opciones
        const groupedData = filteredData.reduce((groups, item) => {
            const groupKey = groupBy(item);
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
            return groups;
        }, {} as Record<string, T[]>);

        options = Object.entries(groupedData).map(([groupKey, items]) => (
            <OptGroup key={groupKey} label={renderGroupTitle(groupKey)}>
                {items.map((item) => (
                    <Option key={keySelector(item)} value={keySelector(item)}>
                        {renderOption(item)}
                    </Option>
                ))}
            </OptGroup>
        ));
    } else {
        // Sin agrupación
        options = filteredData.map((item) => (
            <Option key={keySelector(item)} value={keySelector(item)}>
                {renderOption(item)}
            </Option>
        ));
    }

    // Manejar el cambio de selección
    const handleChange = (valueKey: string) => {
        const selectedItem = data.find((item) => keySelector(item) === valueKey);
        if (selectedItem && onChange) {
            onChange(valueKey);
        }
    };

    const onClear = () => {
        if (onChange) {
            onChange(null);
        }
    };

    return (
        <Select
            showSearch
            placeholder={placeholder}
            value={value ? value : null}
            onChange={handleChange}
            onSearch={(value) => setSearchValue(value)}
            filterOption={false}
            notFoundContent={null}
            allowClear
            onClear={onClear}
            style={style}
        >
            {options}
        </Select>
    );
}

export default SearchableSelect;