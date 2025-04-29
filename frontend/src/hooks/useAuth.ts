import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector, useAppDispatch } from '@/store';
import { setAuth, setUser, User } from '@/store/slices/userSlice';
import * as api from '../utils/api';

interface AuthState {
  user: User | null;
  loading: boolean;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export function useAuth(requireAuth = false) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAndRestoreAuth = async () => {
      try {
        // 如果已经登录，直接返回
        if (isAuthenticated && user) {
          setIsLoading(false);
          return;
        }

        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser) as User;
            if (
              parsedUser &&
              typeof parsedUser === 'object' &&
              'id' in parsedUser &&
              'email' in parsedUser &&
              'username' in parsedUser
            ) {
              // 恢复状态
              dispatch(setAuth(true));
              dispatch(setUser(parsedUser));
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.error('Failed to parse user data:', error);
          }
        }

        // 如果没有有效的认证信息，并且需要认证
        if (requireAuth) {
          // 清除无效的认证信息
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch(setAuth(false));
          dispatch(setUser(null));

          // 只有在非登录页面时才重定向
          if (router.pathname !== '/login') {
            router.replace('/login');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (requireAuth) {
          handleInvalidAuth();
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAndRestoreAuth();
  }, [dispatch, requireAuth, router, isAuthenticated, user]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.login({ username: email, password });
      localStorage.setItem('token', response.access_token);
      
      // 获取用户信息
      const userData = await api.getCurrentUser();
      localStorage.setItem('user', JSON.stringify(userData));
      dispatch(setAuth(true));
      dispatch(setUser(userData));
      
      // 登录成功后跳转到控制台
      router.push('/dashboard');
      return { success: true };
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
      await api.register({ username, email, password });
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
    localStorage.removeItem('user');
    dispatch(setAuth(false));
    dispatch(setUser(null));
    router.push('/login');
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        handleInvalidAuth();
        return;
      }

      const currentUser = await api.getCurrentUser();
      if (currentUser) {
        localStorage.setItem('user', JSON.stringify(currentUser));
        dispatch(setAuth(true));
        dispatch(setUser(currentUser));
      } else {
        handleInvalidAuth();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      handleInvalidAuth();
    }
  };

  const handleInvalidAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch(setAuth(false));
    dispatch(setUser(null));
    
    // 只有当当前不在登录页时才重定向
    if (requireAuth && router.pathname !== '/login') {
      router.replace('/login');
    }
  };

  return {
    isAuthenticated,
    user,
    login,
    register,
    logout,
    checkAuth,
    isLoading,
  };
} 