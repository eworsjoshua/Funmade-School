import { createContext, useContext } from "react";

export const AuthContext = createContext(null);

// Use inside any component: const { user, loading, login, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);
