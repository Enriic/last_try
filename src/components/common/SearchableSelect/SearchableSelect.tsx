// src/components/SearchableSelect/SearchableSelect.tsx

import React from 'react';
import { Select, Spin } from 'antd';

const { Option } = Select;

interface SearchableSelectProps<T> {
    data: T[];
    value?: string | null;
    onChange?: (value: string | null) => void;
    placeholder?: string;
    disabled?: boolean;
    style?: React.CSSProperties;
    renderOption: (item: T) => React.ReactNode;
    keySelector: (item: T) => string;
    onSearch?: (value: string) => void;
    loading?: boolean;
    onLoadMore?: () => void;
    hasMore?: boolean;
    isLoadingMore?: boolean;
    dropdownStyle?: React.CSSProperties;
}

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

    const handleSearch = (value: string) => {
        if (onSearch) {
            onSearch(value);
        }
    };

    const handleChange = (valueKey: string | null) => {
        if (onChange) {
            onChange(valueKey);
        }
    };

    const onClear = () => {
        if (onChange) {
            onChange(null);
        }
    };


    const options = data.map((item) => (
        <Option key={keySelector(item)} value={keySelector(item)}>
            {renderOption(item)}
        </Option>
    ));

    const handlePopupScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.scrollTop + target.clientHeight >= target.scrollHeight - 20) {
            if (onLoadMore && hasMore && !isLoadingMore) {
                onLoadMore();
            }
        }
    };

    return (
        <Select
            showSearch
            placeholder={placeholder}
            value={value ? value : null}
            onChange={handleChange}
            onSearch={handleSearch}
            filterOption={false}
            allowClear
            notFoundContent={loading ? <Spin size="small" /> : null}
            disabled={disabled}
            onClear={onClear}
            style={style}
            onPopupScroll={handlePopupScroll}
            dropdownStyle={dropdownStyle ? dropdownStyle : { overflowY: 'scroll'}}
        >
            {options}
        </Select>
    );
}

export default SearchableSelect;