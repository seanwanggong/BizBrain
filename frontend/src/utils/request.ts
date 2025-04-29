import axios from 'axios';
import { message } from 'antd';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// 创建axios实例
const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
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

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // 未授权，跳转到登录页
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          message.error('没有权限执行此操作');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器错误，请稍后重试');
          break;
        default:
          message.error(data.message || '请求失败');
      }
    } else if (error.request) {
      message.error('网络错误，请检查您的网络连接');
    } else {
      message.error('请求配置错误');
    }
    return Promise.reject(error);
  }
);

export const request = async (url: string, options: any = {}) => {
  try {
    const response = await instance({
      url,
      ...options,
    });
    return response;
  } catch (error) {
    throw error;
  }
}; 