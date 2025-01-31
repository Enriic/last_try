// src/components/Validation


import React, { useEffect, useState } from 'react';
import { notification, Spin } from 'antd';
import { getValidationsForSelect } from '../../../../services/validationService';
import { Validation } from '../../../../types';
import SearchableSelect from '../SearchableSelect';
import { debounce } from 'lodash';


interface ValidationSelectProps {
    value?: string | null;
    onChange?: (value: string | null) => void;
    placeholder?: string;
    style?: React.CSSProperties;
}

const ValidationSelect: React.FC<ValidationSelectProps> = ({ value, onChange, placeholder, style }) => {
    const [validations, setValidations] = useState<Validation[]>([]);
    const [page, setPage] = useState<number>(1);
    const [pageSize] = useState<number>(10);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');

    useEffect(() => {
        fetchValidations(page, searchValue);
    }, [searchValue]);


    const fetchValidations = async (pageNumber: number, search: string) => {
        try {
            if (pageNumber === 1) {
                setLoading(true);
            } else {
                setIsLoadingMore(true);
            }
            const data = await getValidationsForSelect(pageNumber, pageSize, search);
            const { results, count } = data;
            console.log('validaciones cargadas: ', data.results)

            if (pageNumber === 1) {
                setValidations(results);
            } else {
                setValidations((prevValidations) => [...prevValidations, ...results]);
            }
            setTotalItems(count);
            setPage(pageNumber);

        } catch (error) {
            notification.error({
                message: '¡Ups! Algo salió mal',
                description: 'Ocurrió un error al obtener las compañías',
                duration: 3,
            });
        } finally {
            if (pageNumber === 1) {
                setLoading(false);
            } else {
                setIsLoadingMore(false);
            }
        }
    };

    const handleLoadMore = () => {
        if (isLoadingMore || validations.length >= totalItems) {
            return;
        }
        const nextPage = page + 1;
        fetchValidations(nextPage, searchValue);
    };

    const debouncedHandleSearch = debounce((value: string) => {
        setSearchValue(value);
        setPage(1);
    }, 600);

    const handleSelectChange = (value: string | null) => {
        if (onChange) {
            onChange(value);
        }
        if (!value) {
            setSearchValue('');
            setPage(1);
        }
    };


    const renderOption = (item: Validation) => item.id;

    const keySelector = (item: Validation) => item.id;

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