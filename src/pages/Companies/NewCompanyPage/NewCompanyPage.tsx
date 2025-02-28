// src/pages/Company/CompaniesPage.tsx

import React, { useState, useEffect } from 'react';
import './NewCompanyPage.less';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import CompanyForm from '../../../components/Forms/CompanyForm/CompanyForm';
import { PageContainer } from '@ant-design/pro-layout';
import { useTranslation } from 'react-i18next'; // Importar el hook de traducción
import { ArrowLeftOutlined } from '@ant-design/icons';


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
                        onClick={() => navigate('/companies')}
                    >
                        {t('common.back') || 'Volver'}
                    </Button>
                ],
            }}
        >
            <div>
                <CompanyForm />
            </div>
        </PageContainer>
    );
};

export default NewCompanyPage;