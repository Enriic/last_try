// src/pages/Company/NewCompanyPage.tsx

import React, { useState, useEffect } from 'react';
import './NewCompanyPage.less';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import CompanyForm from '../../../components/Forms/CompanyForm/CompanyForm';
import { PageContainer } from '@ant-design/pro-layout';
import { useTranslation } from 'react-i18next'; // Importar el hook de traducción
import { ArrowLeftOutlined } from '@ant-design/icons';

/**
 * Página para crear una nueva compañía
 */
const NewCompanyPage: React.FC = () => {
    /* Hook para acceder a las funciones de traducción */
    const { t } = useTranslation();
    /* Hook para la navegación entre páginas */
    const navigate = useNavigate();

    return (
        <PageContainer
            className="page-container"
            header={{
                title: t('newCompanyPage.title'), // Usar traducción para el título
                /* Botones adicionales en la cabecera */
                extra: [
                    <Button
                        key="back"
                        type="default"
                        icon={<ArrowLeftOutlined />}
                        /* Navega a la página de compañías al hacer clic */
                        onClick={() => navigate('/companies')}
                    >
                        {t('common.back') || 'Volver'}
                    </Button>
                ],
            }}
        >
            <div>
                {/* Formulario para crear una nueva compañía */}
                <CompanyForm />
            </div>
        </PageContainer>
    );
};

export default NewCompanyPage;