// src/components/DocumentSelect/DocumentSelect.tsx

import React, { useEffect, useState } from 'react';
import { notification } from 'antd';
import { getDocuments } from '../../../../services/documentService';
import { Document } from '../../../../types';
import SearchableSelect from '../SearchableSelect';

interface DocumentSelectProps {
    value?: string | null;
    onChange?: (value: string | null) => void;
    placeholder?: string;
    style?: React.CSSProperties;
}

const DocumentSelect: React.FC<DocumentSelectProps> = ({ value, onChange, placeholder, style }) => {
    const [documents, setDocuments] = useState<Document[]>([]);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const data = await getDocuments();
            setDocuments(data);
        } catch (error) {
            notification.error({
                message: '¡Ups! Algo salió mal',
                description: 'Ocurrió un error al obtener los documentos',
                duration: 3,
            });
        }
    };

    const filterOption = (input: string, option: Document) => {
        const lowerCaseValue = input.toLowerCase();
        return option.name.toLowerCase().includes(lowerCaseValue);
    };

    const renderOption = (item: Document) => item.name;

    const keySelector = (item: Document) => item.id;

    return (
        <SearchableSelect<Document>
            data={documents}
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

export default DocumentSelect;