import React from 'react';
import { Modal } from 'antd';
import CompanyForm from '../CompanyForm/CompanyForm';
import { Company } from '../../types';
import './CompanyUpdateModal.less';

interface CompanyUpdateModalProps {
    company: Company;
    visible: boolean;
    onClose: () => void;
}

const CompanyUpdateModal: React.FC<CompanyUpdateModalProps> = ({ company, visible, onClose }) => {
    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            width={'80%'}
            title="Actualizar Compañía"
        >
            <CompanyForm update company={company} onClose={onClose}/>
        </Modal>
    );
};

export default CompanyUpdateModal;
