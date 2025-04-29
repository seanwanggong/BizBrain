import axios, { AxiosRequestConfig } from 'axios';
import { message } from 'antd';
import { store } from '@/store';
import { logout } from '@/store/slices/userSlice';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data, config } = error.response;
      
      // Special handling for login endpoint
      if (config.url?.includes('/auth/login')) {
        if (status === 401) {
          message.error('用户名或密码错误');
          return Promise.reject(new Error('用户名或密码错误'));
        }
      } else if (status === 401) {
        // Handle other 401 errors (not login-related)
        if (!window.location.pathname.includes('/login')) {
          // 清除认证状态
          store.dispatch(logout());
          // 重定向到登录页
          window.location.href = '/login';
        }
        message.error('登录已过期，请重新登录');
        return Promise.reject(error);
      }

      const errorMessages: Record<number, string> = {
        403: '没有权限执行此操作',
        404: '请求的资源不存在',
        500: '服务器错误，请稍后重试'
      };

      const errorMessage = errorMessages[status] || data?.detail || data?.message || '请求失败';
      message.error(errorMessage);
    } else if (error.request) {
      message.error('网络错误，请检查您的网络连接');
    } else {
      message.error('请求配置错误');
    }
    return Promise.reject(error.response?.data || error);
  }
);

export async function request<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
  try {
    console.log('Request starting:', { url, method: options?.method || 'GET' });
    
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    };

    console.log('Request headers:', { 
      hasToken: !!token,
      contentType: headers['Content-Type']
    });

    const response = await axios({
      baseURL: API_BASE_URL,
      url,
      ...options,
      headers,
    });

    console.log('Request successful:', {
      url,
      status: response.status,
      hasData: !!response.data
    });

    return response.data;
  } catch (error: any) {
    console.error('Request failed:', {
      url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    // Handle error messages
    if (error.response) {
      const errorMessage = error.response.data?.detail || error.response.data?.message || '请求失败';
      message.error(errorMessage);

      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        if (!window.location.pathname.includes('/login')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    } else {
      message.error('网络错误，请稍后重试');
    }

    throw error;
  }
} 