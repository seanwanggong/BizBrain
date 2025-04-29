import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import * as api from '../utils/api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
}

interface LoginResponse {
  success: boolean;
  error?: string;
  access_token?: string;
}

export const useAuth = () => {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthState({ user: null, loading: false });
        return;
      }

      const user = await api.getCurrentUser();
      setAuthState({ user, loading: false });
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setAuthState({ user: null, loading: false });
    }
  };

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const data = await api.login(email, password);
      localStorage.setItem('token', data.access_token);
      await checkAuth();
      return { success: true, access_token: data.access_token };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '登录请求失败，请检查网络连接'
      };
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const data = await api.register(username, email, password);
      localStorage.setItem('token', data.access_token);
      await checkAuth();
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '注册请求失败，请检查网络连接'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({ user: null, loading: false });
    router.push('/login');
  };

  return {
    user: authState.user,
    loading: authState.loading,
    login,
    register,
    logout,
    checkAuth,
  };
}; 