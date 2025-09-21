import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiFetch from '../services/api';

// Estado inicial seguro para producción
const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

// Acciones posibles
const AuthReducer = (state, action) => {
  switch (action.type) {
    case 'INIT_START':
      return { ...state, loading: true, error: null };
    case 'INIT_DONE':
      return { ...state, loading: false };
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false };
    case 'LOGIN_FAILURE':
      return { ...state, error: action.payload, loading: false };
    case 'LOGOUT':
      return { ...initialState };
    default:
      return state;
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, initialState);

  // Rehidratar sesión al montar
  useEffect(() => {
    const boot = async () => {
      dispatch({ type: 'INIT_START' });
      const savedToken = localStorage.getItem('token');
      if (!savedToken) {
        dispatch({ type: 'INIT_DONE' });
        return;
      }
      try {
        // intentamos obtener el usuario actual
        const data = await apiFetch('/api/auth/me');
        if (data && data.user) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user: data.user, token: savedToken } });
        }
      } catch (e) {
        // token inválido/expirado
        localStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
      } finally {
        dispatch({ type: 'INIT_DONE' });
      }
    };
    boot();
  }, []);

  // Métodos de autenticación
  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const data = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      dispatch({ type: 'LOGIN_SUCCESS', payload: data });
      // Guardar token en localStorage para persistencia
      localStorage.setItem('token', data.token);
    } catch (err) {
      dispatch({ type: 'LOGIN_FAILURE', payload: err.message || 'Error al iniciar sesión' });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
