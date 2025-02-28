//src/components/EmployeeUpdateModal/EmployeeUpdateModal.tsx

import React from 'react';
import { Modal } from 'antd';
import EmployeeForm from '../../Forms/EmployeeForm/EmployeeForm';
import { Resource } from '../../../types';

interface EmployeeUpdateModalProps {
    employee: Resource;
    visible: boolean;
    onClose: () => void;
}

const EmployeeUpdateModal: React.FC<EmployeeUpdateModalProps> = ({ employee, visible, onClose }) => {
    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            width={'80%'}
            title="Actualizar Compañía"
        >
            <EmployeeForm update employee={employee} onClose={onClose} />
        </Modal>
    );
};

export default EmployeeUpdateModal;
