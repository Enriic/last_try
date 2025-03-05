// src/pages/Resources/NewEmployeePage/NewEmployeePage.tsx

import React from 'react';
import './NewEmployeePage.less';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@ant-design/pro-layout';
import { useTranslation } from 'react-i18next'; // Importar el hook de traducción
import { ArrowLeftOutlined } from '@ant-design/icons';
import EmployeeResourceForm from '../../../components/Forms/EmployeeForm/EmployeeForm';

/**
 * Página para crear un nuevo empleado
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
                title: t('newEmployeePage.title'), // Usar traducción para el título
                /* Botones adicionales en la cabecera */
                extra: [
                    <Button
                        key="back"
                        type="default"
                        icon={<ArrowLeftOutlined />}
                        /* Navega a la página de empleados al hacer clic */
                        onClick={() => navigate('/resources/employees')}
                    >
                        {t('common.back') || 'Volver'}
                    </Button>
                ],
            }}
        >
            <div>
                {/* Formulario para crear un nuevo empleado */}
                <EmployeeResourceForm />
            </div>
        </PageContainer>
    );
};

export default NewCompanyPage;