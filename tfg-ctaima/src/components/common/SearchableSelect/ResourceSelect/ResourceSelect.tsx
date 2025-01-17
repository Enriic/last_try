// src/components/ResourceSelect/ResourceSelect.tsx

import React, { useEffect, useState } from 'react';
import { notification } from 'antd';
import { getResources } from '../../../../services/resourceService';
import { Resource, EmployeeDetails, VehicleDetails } from '../../../../types';
import SearchableSelect from '../../SearchableSelect/SearchableSelect';

interface ResourceSelectProps {
    value?: string | null;
    onChange?: (value: string | null) => void;
    placeholder?: string;
    style?: React.CSSProperties;
}

const ResourceSelect: React.FC<ResourceSelectProps> = ({ value, onChange, placeholder, style }) => {
    const [resources, setResources] = useState<Resource[]>([]);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const data = await getResources();
            setResources(data);
        } catch (error) {
            notification.error({
                message: '¡Ups! Algo salió mal',
                description: 'Ocurrió un error al obtener los recursos',
                duration: 3,
            });
        }
    };

    const filterOption = (input: string, option: Resource) => {
        const lowerCaseValue = input.toLowerCase();
        if (option.resource_type === 'vehicle') {
            const vehicle = option.resource_details as VehicleDetails;
            return (
                vehicle.name.toLowerCase().includes(lowerCaseValue) ||
                vehicle.registration_id.toLowerCase().includes(lowerCaseValue)
            );
        } else if (option.resource_type === 'employee') {
            const employee = option.resource_details as EmployeeDetails;
            const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
            return (
                fullName.includes(lowerCaseValue) ||
                employee.worker_id.toLowerCase().includes(lowerCaseValue)
            );
        }
        return false;
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

    const groupBy = (item: Resource) => item.resource_type;

    const renderGroupTitle = (group: string) => (group === 'vehicle' ? 'Vehículos' : 'Empleados');

    return (
        <SearchableSelect<Resource>
            data={resources}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            filterOption={filterOption}
            renderOption={renderOption}
            keySelector={keySelector}
            groupBy={groupBy}
            renderGroupTitle={renderGroupTitle}
            style={style}
        />
    );
};

export default ResourceSelect;