// src/components/CompanySelect/CompanySelect.tsx

import React, { useEffect, useState } from 'react';
import { notification } from 'antd';
import { getCompanies } from '../../../../services/companyService';
import { Company } from '../../../../types';
import SearchableSelect from '../SearchableSelect';

interface CompanySelectProps {
    value?: string | null;
    onChange?: (value: string | null) => void;
    placeholder?: string;
    style?: React.CSSProperties;
}

const CompanySelect: React.FC<CompanySelectProps> = ({ value, onChange, placeholder, style }) => {
    const [companies, setCompanies] = useState<Company[]>([]);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const data = await getCompanies();
            setCompanies(data);
        } catch (error) {
            notification.error({
                message: '¡Ups! Algo salió mal',
                description: 'Ocurrió un error al obtener las compañías',
                duration: 3,
            });
        }
    };

    const filterOption = (input: string, option: Company) => {
        const lowerCaseValue = input.toLowerCase();
        return (
            option.company_name.toLowerCase().includes(lowerCaseValue) ||
            option.tax_id.toLowerCase().includes(lowerCaseValue)
        );
    };

    const renderOption = (item: Company) => `${item.company_name} - ${item.tax_id}`;

    const keySelector = (item: Company) => item.id;

    return (
        <SearchableSelect<Company>
            data={companies}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            style={style}
            filterOption={filterOption}
            renderOption={renderOption}
            keySelector={keySelector}
        />
    );
};

export default CompanySelect;