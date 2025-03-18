// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginService, logout as logoutService } from '../services/authService';
import axios from 'axios';
import { Spin } from 'antd';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface User {
    username: string;
    id: string;
    email: string;
    roles: string[];
    // Agrega otros campos necesarios
}

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Función para obtener el usuario actual
    const fetchCurrentUser = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/users/current/`, {
                withCredentials: true,
                
            });

            console.log(response.data.roles)
            setUser(response.data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Verificar si el usuario está autenticado al cargar la aplicación
    useEffect(() => {
        const checkAuth = async () => {
            setLoading(true);
            await fetchCurrentUser();
        };
        checkAuth();
    }, []);

    const login = async (username: string, password: string) => {
        await loginService(username, password);
        await fetchCurrentUser();
    };

    const logout = async () => {
        try {
            await logoutService();
            setUser(null);
        } catch (error) {
            console.error('Error al cerrar sesión', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {loading ? <Spin /> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};