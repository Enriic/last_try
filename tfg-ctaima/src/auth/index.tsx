import React, { createContext, useContext } from 'react';

interface User {
    name: string;
    roles: string[];
}

const AuthContext = createContext<User | null>(null);

export const AuthProvider: React.FC = ({ children }) => {
    const user: User = {
        name: 'Juan Pérez',
        roles: ['editor'],
    };

    return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};