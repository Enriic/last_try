import React, { useEffect, useMemo, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import SearchTableInputProps from './SearchTableInput.types';
import { ProFormText } from '@ant-design/pro-form';
import './SearchTableInput.less';

const SearchTableInput: React.FC<SearchTableInputProps> = ({
  onSearchChange,
  placeholder,
  timeout = 300,
  disabled,
}: SearchTableInputProps) => {
  const [query, setQuery] = useState<string>();

  useEffect(() => {
    const timeOutId = setTimeout(() => onSearchChange(query), timeout);
    return () => clearTimeout(timeOutId);
  }, [query]);

  const showSearch = useMemo(() => {
    if (query && query.length > 0) return false;
    else return true;
  }, [query]);

  return (
    <div className='search-table-input'>
      <ProFormText
        disabled={disabled ?? false}
        allowClear
        width="sm"
        fieldProps={{
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.currentTarget.value),
          suffix: (
            <SearchOutlined
              className='ant-select-arrow'
              style={{ display: showSearch ? 'inherit' : 'none' }}
            />
          ),
          maxLength: 256,
          placeholder,
        }}
      />
    </div>
  );
};

export default SearchTableInput;
