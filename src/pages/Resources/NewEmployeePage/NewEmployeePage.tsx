// src/pages/Resources/NewEmployeePage/NewEmployeePage.tsx

import React from 'react';
import './NewEmployeePage.less';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@ant-design/pro-layout';
import { useTranslation } from 'react-i18next'; // Importar el hook de traducción
import { ArrowLeftOutlined } from '@ant-design/icons';
import EmployeeResourceForm from '../../../components/Forms/EmployeeForm/EmployeeForm';


const NewCompanyPage: React.FC = () => {
    const { t } = useTranslation(); // Utilizar el hook de traducción
    const navigate = useNavigate();

    return (
        <PageContainer
            className="page-container"
            header={{
                title: t('companiesPage.title'), // Usar traducción para el título
                extra: [
                    <Button
                        key="back"
                        type="default"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/resources/employees')}
                    >
                        {t('common.back') || 'Volver'}
                    </Button>
                ],
            }}
        >
            <div>
                <EmployeeResourceForm />
            </div>
        </PageContainer>
    );
};

export default NewCompanyPage;