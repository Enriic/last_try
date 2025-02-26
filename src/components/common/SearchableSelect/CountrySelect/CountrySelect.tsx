// src/components/CompanySelect/CountrySelect.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { getField } from '../../../../services/utilsService';
import SearchableSelect from '../SearchableSelect';
import { debounce } from 'lodash';
import { CountryName, CountryName_Idd_Cioc } from '../../../../types/country';
import { match } from 'assert';

// Se crea un tipo unión para admitir ambos formatos.
type CountryData = CountryName | CountryName_Idd_Cioc;

interface CountrySelectProps {
    value?: string | null;
    onChange?: (value: string | null) => void;
    placeholder?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
    field?: string;
    /** Indica si se debe renderizar la versión extendida, mostrando datos adicionales como "cioc" */
    extended?: boolean;
}

const CountrySelect: React.FC<CountrySelectProps> = ({
    value,
    onChange,
    placeholder,
    style,
    disabled,
    field = 'name',
    extended = false,
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');
    const [countries, setCountries] = useState<CountryData[]>([]);

    useEffect(() => {
        fetchCountries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchValue]);

    const fetchCountries = async () => {
        setLoading(true);
        try {
            const data = await getField(field);
            setCountries(data);
        } catch (error) {
            console.error("Error al obtener los países:", error);
        } finally {
            setLoading(false);
        }
    };

    const debouncedHandleSearch = debounce((value: string) => {
        setSearchValue(value);
    }, 400);

    const handleSelectChange = (value: string | null) => {
        if (onChange) {
            if (extended && value) {
                // Buscar el país por su nombre (key) para extraer su idd
                const selectedCountry = countries.find(country => country.name.common === value);
                if (selectedCountry && 'idd' in selectedCountry && selectedCountry.idd) {
                    const iddValue = `${selectedCountry.idd.root}${selectedCountry.idd.suffixes?.[0] || ""}`;
                    onChange(iddValue);
                } else {
                    onChange(null);
                }
            } else {
                onChange(value);
            }
        }
        if (!value) {
            setSearchValue('');
        }
    };

    const filteredCountries = useMemo(() => {
        if (!searchValue) return countries;
        return countries.filter((country) => {
            let match = country.name.common.toLowerCase().includes(searchValue.toLowerCase());
            if (extended && !match) {
                const full_idd = ((country as CountryName_Idd_Cioc).idd.root + (country as CountryName_Idd_Cioc).idd.suffixes[0])
                match = full_idd.includes(searchValue) || (country as CountryName_Idd_Cioc).cioc.toLowerCase().includes(searchValue.toLowerCase());
            }
            return match;
        }

        );
    }, [countries, searchValue]);

    const renderOption = (item: CountryData) => {
        // Si se activa el modo extendido y el objeto tiene la propiedad "cioc", se muestra junto al nombre
        if (extended && 'cioc' in item && 'idd' in item) {
            return (
                <>
                    ({item.cioc}) {item.idd?.root || ""}{item.idd?.suffixes?.[0] || ""} - {item.name.common}
                </>
            );
        }
        return item.name.common;
    };

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
