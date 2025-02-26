// src/pages/Dashboard/DashboardPage.tsx

import React, { useState, useEffect } from 'react';
import './ResourcesPage.less';
import ResourceForm from '../../components/ResourceForm/ResourceForm';
import { PageContainer } from '@ant-design/pro-layout';
import { useTranslation } from 'react-i18next'; // Importar el hook de traducción


const ResourcesPage: React.FC = () => {
    const { t } = useTranslation(); // Utilizar el hook de traducción

    // useEffect(() => {
    //     fetchData()
    // }, []);

    // const fetchData = async () => {

    //};
    return (
        <PageContainer
            header={{
                title: t('resourcesPage.title'), // Usar traducción para el título
                className: 'page-container-header',
            }}
        >
            <div>
                <ResourceForm />
            </div>
        </PageContainer>
    );
};

export default ResourcesPage;