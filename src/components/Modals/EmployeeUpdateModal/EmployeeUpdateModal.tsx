//src/components/EmployeeUpdateModal/EmployeeUpdateModal.tsx

import React from 'react';
import { Modal } from 'antd';
import EmployeeForm from '../../Forms/EmployeeForm/EmployeeForm';
import { Resource } from '../../../types';

{/* Interfaz para las propiedades del modal de actualización de empleado */ }
interface EmployeeUpdateModalProps {
    employee: Resource;
    visible: boolean;
    onClose: () => void;
}

{/* Componente para el modal de actualización de empleado */ }
const EmployeeUpdateModal: React.FC<EmployeeUpdateModalProps> = ({ employee, visible, onClose }) => {
    return (
        < Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            width={'80%'}
            title="Actualizar Compañía"
        >
            {/* Formulario para actualizar el empleado */}
            < EmployeeForm update employee={employee} onClose={onClose} />
        </Modal >
    );
};

export default EmployeeUpdateModal;