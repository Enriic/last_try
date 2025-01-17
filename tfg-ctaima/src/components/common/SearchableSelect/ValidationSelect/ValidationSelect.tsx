// src/components/Validation
//Select/Validation
//Select.tsx

import React, { useEffect, useState } from 'react';
import { notification } from 'antd';
import { getValidations } from '../../../../services/validationService';
import { Validation

 } from '../../../../types';
import SearchableSelect from '../SearchableSelect';

interface ValidationSelectProps {
    value?: string | null;
    onChange?: (value: string | null) => void;
    placeholder?: string;
    style?: React.CSSProperties;
}

const ValidationSelect: React.FC<ValidationSelectProps> = ({ value, onChange, placeholder, style }) => {
    const [Validations, setValidations] = useState<Validation[]>([]);

    useEffect(() => {
        fetchValidations();
    }, []);

    const fetchValidations = async () => {
        try {
            const data = await getValidations(true, null);
            setValidations(data);
        } catch (error) {
            notification.error({
                message: '¡Ups! Algo salió mal',
                description: 'Ocurrió un error al obtener los Validationos',
                duration: 3,
            });
        }
    };

    const filterOption = (input: string, option: Validation) => {
        const lowerCaseValue = input.toLowerCase();
        return option.id.toLowerCase().includes(lowerCaseValue);
    };

    const renderOption = (item: Validation ) => item.id;

    const keySelector = (item: Validation ) => item.id;

    return (
        <SearchableSelect<Validation>
            data={Validations}
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

export default ValidationSelect;