// src/components/CompanySelect/CompanySelect.tsx

import React, { useEffect, useState } from 'react';
import { notification } from 'antd';
import { getCompanies } from '../../../../services/companyService';
import { Company } from '../../../../types';
import SearchableSelect from '../SearchableSelect';
import { debounce } from 'lodash';

interface CompanySelectProps {
    value?: string | null;
    onChange?: (value: string | null) => void;
    placeholder?: string;
    style?: React.CSSProperties;
}

const CompanySelect: React.FC<CompanySelectProps> = ({ value, onChange, placeholder, style }) => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [page, setPage] = useState<number>(1);
    const [pageSize] = useState<number>(10);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');

    useEffect(() => {
        fetchCompanies(1, searchValue);
    }, [searchValue]);

    const fetchCompanies = async (pageNumber: number, search: string) => {
        try {
            if (pageNumber === 1) {
                setLoading(true);
            } else {
                setIsLoadingMore(true);
            }
            const data = await getCompanies(pageNumber, pageSize, search);
            const { results, count } = data;

            if (pageNumber === 1) {
                setCompanies(results);
            } else {
                setCompanies((prevCompanies) => [...prevCompanies, ...results]);
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
        if (isLoadingMore || companies.length >= totalItems) {
            return;
        }
        const nextPage = page + 1;
        fetchCompanies(nextPage, searchValue);
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

    const renderOption = (item: Company) => `${item.company_name} - ${item.company_id}`;

    const keySelector = (item: Company) => item.id;

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
        />
    );
};

export default CompanySelect;