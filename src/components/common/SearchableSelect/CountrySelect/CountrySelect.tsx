// src/components/common/SearchableSelect/CountrySelect/CountrySelect.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { getField } from '../../../../services/utilsService';
import SearchableSelect from '../SearchableSelect';
import { debounce } from 'lodash';
import { CountryName, CountryName_Idd_Cioc } from '../../../../types/country';

/**
 * Tipo unión para admitir ambos formatos de datos de países
 */
type CountryData = CountryName | CountryName_Idd_Cioc;

/**
 * Props para el componente CountrySelect
 */
interface CountrySelectProps {
    value?: string | null;
    onChange?: (value: string | null) => void;
    placeholder?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
    /** Campo a utilizar para obtener los datos (por defecto 'name') */
    field?: string;
    extended?: boolean;
    /** Función para vincular con otro selector de prefijo telefónico */
    onCountrySelect?: (country: CountryData | null) => void;
}

/**
 * Componente para seleccionar países con búsqueda y opciones extendidas
 * 
 * Permite seleccionar países y mostrar información adicional como códigos telefónicos
 * cuando se activa el modo extendido
 */
const CountrySelect: React.FC<CountrySelectProps> = ({
    value,
    onChange,
    placeholder,
    style,
    disabled,
    field = 'name',
    extended = false,
    onCountrySelect,
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');
    const [countries, setCountries] = useState<CountryData[]>([]);

    /**
     * Obtener países al montar el componente o cambiar el término de búsqueda
     */
    useEffect(() => {
        fetchCountries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchValue]);

    /**
     * Obtiene el listado de países desde el servidor
     */
    const fetchCountries = async () => {
        setLoading(true);
        try {
            const data = await getField(field);
            // Ordenar para que España aparezca primero
            const sortedData = sortCountriesWithSpainFirst(data);
            setCountries(sortedData);
        } catch (error) {
            console.error("Something went wrong trying to fetch countries", error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Ordena la lista de países para que España aparezca primero
     * @param data Lista de países a ordenar
     * @returns Lista ordenada con España como primer elemento
     */
    const sortCountriesWithSpainFirst = (data: CountryData[]) => {
        return [...data].sort((a, b) => {
            // España primero
            if (a.name.common === 'Spain') return -1;
            if (b.name.common === 'Spain') return 1;
            // El resto en orden alfabético
            return a.name.common.localeCompare(b.name.common);
        });
    };

    /**
     * Maneja la búsqueda con debounce para evitar peticiones excesivas
     */
    const debouncedHandleSearch = debounce((value: string) => {
        setSearchValue(value);
    }, 400);

    /**
     * Maneja el cambio de valor seleccionado con soporte para modo extendido
     * @param value Valor seleccionado (nombre del país)
     */
    const handleSelectChange = (value: string | null) => {
        if (onChange) {
            if (extended && value) {
                // Buscar el país por su nombre (key) para extraer su idd
                const selectedCountry = countries.find(country => country.name.common === value);
                if (selectedCountry && 'idd' in selectedCountry && selectedCountry.idd) {
                    // Combinar prefijo con sufijo del país para tener el código telefónico completo
                    const iddValue = `${selectedCountry.idd.root}${selectedCountry.idd.suffixes?.[0] || ""}`;
                    onChange(iddValue);
                } else {
                    onChange(null);
                }
            } else {
                onChange(value);
            }
        }

        // Si se seleccionó un país y existe la función onCountrySelect
        if (value && onCountrySelect) {
            const selectedCountry = countries.find(country => country.name.common === value);
            onCountrySelect(selectedCountry || null);
        }

        // Limpiar búsqueda y notificar si se deselecciona
        if (!value) {
            setSearchValue('');
            if (onCountrySelect) onCountrySelect(null);
        }
    };

    /**
     * Filtra países en función del término de búsqueda
     * En modo extendido también busca por código telefónico y CIOC
     */
    const filteredCountries = useMemo(() => {
        if (!searchValue) return countries;
        return countries.filter((country) => {
            let match = country.name.common.toLowerCase().includes(searchValue.toLowerCase());
            if (extended && !match && 'idd' in country && 'cioc' in country) {
                const full_idd = (country.idd.root + (country.idd.suffixes?.[0] || ""));
                match = full_idd.includes(searchValue) || (country.cioc?.toLowerCase().includes(searchValue.toLowerCase()) || false);
            }
            return match;
        });
    }, [countries, searchValue, extended]);

    /**
     * Define cómo se visualiza cada opción en el desplegable
     * En modo extendido incluye código CIOC y prefijo telefónico
     */
    const renderOption = (item: CountryData) => {
        // Si se activa el modo extendido y el objeto tiene la propiedad "cioc", se muestra junto al nombre
        if (extended && 'cioc' in item && 'idd' in item) {
            return (
                <>
                    ({item.cioc || ""}) {item.idd?.root || ""}{item.idd?.suffixes?.[0] || ""} - {item.name.common}
                </>
            );
        }
        return item.name.common;
    };

    /**
     * Define qué campo usar como clave única para cada opción
     */
    const keySelector = (item: CountryData) => item.name.common;

    return (
        <SearchableSelect<CountryData>
            data={filteredCountries}
            value={value}
            onChange={handleSelectChange}
            placeholder={placeholder}
            style={style}
            renderOption={renderOption}
            keySelector={keySelector}
            loading={loading}
            onSearch={debouncedHandleSearch}
            disabled={disabled}
            dropdownStyle={extended ? { overflowY: 'scroll', width: 400 } : undefined}
        />
    );
};

export default CountrySelect;