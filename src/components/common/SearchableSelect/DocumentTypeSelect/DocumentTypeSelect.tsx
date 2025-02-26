// src/components/DocumentTypeSelect/DocumentTypeSelect.tsx

import React, { useEffect, useState } from 'react';
import { notification } from 'antd';
import { getDocumentTypes } from '../../../../services/documentService';
import { DocumentType } from '../../../../types';
import SearchableSelect from '../SearchableSelect';
import { debounce } from 'lodash';

interface DocumentTypeSelectProps {
    value?: string | null;
    onChange?: (value: string | null | number) => void;
    placeholder?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
}

const DocumentTypeSelect: React.FC<DocumentTypeSelectProps> = ({ value, onChange, disabled, placeholder, style }) => {
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [page, setPage] = useState<number>(1);
    const [pageSize] = useState<number>(10);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');

    useEffect(() => {
        fetchDocumentTypes(1, searchValue);
    }, [searchValue]);

    const fetchDocumentTypes = async (pageNumber: number, search: string) => {
        try {
            if (pageNumber === 1) {
                setLoading(true);
            } else {
                setIsLoadingMore(true);
            }
            const data = await getDocumentTypes(pageNumber, pageSize, search);
            const { results, count } = data;

            if (pageNumber === 1) {
                setDocumentTypes(results);
            } else {
                setDocumentTypes((prevDocumentTypes) => [...prevDocumentTypes, ...results]);
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
        if (isLoadingMore || documentTypes.length >= totalItems) {
            return;
        }
        const nextPage = page + 1;
        fetchDocumentTypes(nextPage, searchValue);
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

    const renderOption = (item: DocumentType) => item.name;

    const keySelector = (item: DocumentType) => item.id.toString();

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