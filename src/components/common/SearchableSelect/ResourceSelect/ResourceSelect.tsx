// src/components/ResourceSelect/ResourceSelect.tsx

import React, { useEffect, useState } from 'react';
import { debounce } from 'lodash';
import { notification } from 'antd';
import { getResourcesBySearch } from '../../../../services/resourceService';
import { Resource, EmployeeDetails, VehicleDetails } from '../../../../types';
import SearchableSelect from '../../SearchableSelect/SearchableSelect';
import { useTranslation } from 'react-i18next';

interface ResourceSelectProps {
    value?: string | null;
    onChange?: (value: string | null) => void;
    placeholder?: string;
    disabled?: boolean;
    style?: React.CSSProperties;
}

const ResourceSelect: React.FC<ResourceSelectProps> = ({ value, onChange, placeholder, style, disabled }) => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [page, setPage] = useState<number>(1);
    const [pageSize] = useState<number>(10);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');
    const { t } = useTranslation();

    useEffect(() => {
        fetchResources(1, searchValue);
    }, [searchValue]);


    const fetchResources = async (pageNumber: number, search: string) => {
        try {
            if (pageNumber === 1) {
                setLoading(true);
            } else {
                setIsLoadingMore(true);
            }
            const data = await getResourcesBySearch(pageNumber, pageSize, search);
            const { results, count } = data;

            if (pageNumber === 1) {
                setResources(results);
            } else {
                setResources((prevResources) => [...prevResources, ...results]);
            }
            setTotalItems(count);
            setPage(pageNumber);

        } catch (error) {
            notification.error({
                message: t('notification.error.title'),
                description: t('notification.error.description'),
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
        if (isLoadingMore || resources.length >= totalItems) {
            return;
        }
        const nextPage = page + 1;
        fetchResources(nextPage, searchValue);
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

    const keySelector = (item: Resource) => item.id;

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