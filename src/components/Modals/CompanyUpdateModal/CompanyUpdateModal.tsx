// src/components/CompanyUpdateModal/CompanyUpdateModal.tsx

import React from 'react';
import { Modal } from 'antd';
import CompanyForm from '../../Forms/CompanyForm/CompanyForm';
import { Company } from '../../../types';
import './CompanyUpdateModal.less';

{/* Interfaz para las propiedades del modal de actualización de compañía */ }
interface CompanyUpdateModalProps {
    /* Datos de la compañía a actualizar */
    company: Company;
    /* Estado de visibilidad del modal */
    visible: boolean;
    /* Función para cerrar el modal */
    onClose: () => void;
}

{/* Componente para el modal de actualización de compañía */ }
const CompanyUpdateModal: React.FC<CompanyUpdateModalProps> = ({ company, visible, onClose }) => {
    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            width={'80%'}
            title="Actualizar Compañía"
        >
            {/* Formulario para actualizar la compañía */}
            < CompanyForm update company={company} onClose={onClose} />
        </Modal >
    );
};

export default CompanyUpdateModal;