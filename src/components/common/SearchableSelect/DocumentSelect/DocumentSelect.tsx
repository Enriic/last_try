// src/components/DocumentSelect/DocumentSelect.tsx

import React, { useEffect, useState } from 'react';
import { notification } from 'antd';
import { getDocuments } from '../../../../services/documentService';
import { Document } from '../../../../types';
import SearchableSelect from '../SearchableSelect';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';

interface DocumentSelectProps {
    value?: string | null;
    onChange?: (value: string | null) => void;
    placeholder?: string;
    style?: React.CSSProperties;
    
}

const DocumentSelect: React.FC<DocumentSelectProps> = ({ value, onChange, placeholder, style }) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [page, setPage] = useState<number>(1);
    const [pageSize] = useState<number>(10);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');
    const { t } = useTranslation();

    useEffect(() => {
        fetchDocuments(1, searchValue);
    }, [searchValue]);

    const fetchDocuments = async (pageNumber: number, search: string) => {
        try {
            if (pageNumber === 1) {
                setLoading(true);
            } else {
                setIsLoadingMore(true);
            }
            const data = await getDocuments(pageNumber, pageSize, search);
            const { results, count } = data;

            if (pageNumber === 1) {
                setDocuments(results);
            } else {
                setDocuments((prevDocuments) => [...prevDocuments, ...results]);
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
        if (isLoadingMore || documents.length >= totalItems) {
            return;
        }
        const nextPage = page + 1;
        fetchDocuments(nextPage, searchValue);
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



    const renderOption = (item: Document) => item.name;

    const keySelector = (item: Document) => item.id;

    const hasMore = documents.length < totalItems;


    return (
        <SearchableSelect<Document>
            data={documents}
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

export default DocumentSelect;