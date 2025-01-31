// src/components/PrivateRoute.tsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spin } from 'antd';

const PrivateRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        // Puedes mostrar un spinner mientras se verifica la autenticación
        return <Spin/>
    }

    return user ? <Outlet /> : <Navigate to="/login" replace />;

};

export default PrivateRoute;