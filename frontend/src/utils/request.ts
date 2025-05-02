import axios, { AxiosRequestConfig } from 'axios';
import { message } from 'antd';
import { store } from '@/store';
import { logout } from '@/store/slices/userSlice';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_BASE_URL = `${BASE_URL}/api/v1`;

// Create axios instance
const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request deduplication and caching
interface CacheEntry {
  promise: Promise<any>;
  timestamp: number;
  data?: any;
}

const pendingRequests = new Map<string, CacheEntry>();
const CACHE_TTL = 2000; // Cache TTL in milliseconds for GET requests

// Generate cache key for request
const getCacheKey = (url: string, options?: AxiosRequestConfig): string => {
  const method = (options?.method || 'GET').toUpperCase();
  // For GET requests, only use URL and params for cache key
  if (method === 'GET') {
    const params = options?.params ? JSON.stringify(options.params) : '';
    return `${method}:${url}:${params}`;
  }
  // For other methods, include the request body
  const data = options?.data ? JSON.stringify(options.data) : '';
  return `${method}:${url}:${JSON.stringify(options?.params)}:${data}`;
};

// Clear expired cache entries
const clearExpiredCache = () => {
  const now = Date.now();
  for (const [key, entry] of pendingRequests.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      pendingRequests.delete(key);
    }
  }
};

// Normalize URL to handle trailing slashes
const normalizeUrl = (url: string) => {
  // Remove trailing slash only for agent endpoints with IDs
  if (url.includes('/agents/') && /\/agents\/\d+/.test(url) && !url.includes('/execute')) {
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }
  // Add trailing slash for workflow endpoints
  if (url.includes('/workflows/')) {
    return url.endsWith('/') ? url : `${url}/`;
  }
  // Keep trailing slash for other endpoints
  return url;
};

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Normalize the URL to prevent redirect issues
    if (config.url) {
      config.url = normalizeUrl(config.url);
    }
    
    console.log('Request details:', {
      url: `${API_BASE_URL}${config.url}`,
      method: config.method,
      headers: config.headers,
      data: config.data,
      hasToken: !!token,
    });
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    console.log('Response details:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  (error) => {
    console.error('Response error details:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      headers: error.response?.headers,
    });

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
    console.log('Request starting:', { url, method: options?.method || 'GET', options });
    
    const normalizedUrl = normalizeUrl(url);
    const cacheKey = getCacheKey(normalizedUrl, options);
    const method = (options?.method || 'GET').toUpperCase();
    
    // Clear expired cache entries
    clearExpiredCache();
    
    // For GET requests, check cache first
    if (method === 'GET') {
      const cachedEntry = pendingRequests.get(cacheKey);
      if (cachedEntry) {
        const now = Date.now();
        // If within TTL and we have cached data, return it immediately
        if (now - cachedEntry.timestamp <= CACHE_TTL && cachedEntry.data) {
          console.log('Using cached data:', { url: normalizedUrl });
          return cachedEntry.data;
        }
        // If there's a pending request, return its promise
        if (cachedEntry.promise) {
          console.log('Using pending request:', { url: normalizedUrl });
          return cachedEntry.promise;
        }
      }
    }
    
    // Create the new request promise
    const requestPromise = (async () => {
      try {
        const response = await instance.request<T>({
          url: normalizedUrl,
          ...options,
        });

        if (!response) {
          console.error('No response received from server');
          throw new Error('No response received from server');
        }

        if (!response.data) {
          console.error('No data in response:', response);
          throw new Error('No data in response');
        }

        console.log('Request successful:', {
          url: normalizedUrl,
          status: response.status,
          hasData: !!response.data
        });

        // For GET requests, cache the response data
        if (method === 'GET') {
          pendingRequests.set(cacheKey, {
            promise: requestPromise,
            timestamp: Date.now(),
            data: response.data
          });
        }

        return response.data;
      } finally {
        // Remove from pending requests after completion for non-GET requests
        if (method !== 'GET') {
          pendingRequests.delete(cacheKey);
        }
      }
    })();

    // Store the promise in the cache
    pendingRequests.set(cacheKey, {
      promise: requestPromise,
      timestamp: Date.now()
    });
    
    return requestPromise;
  } catch (error: any) {
    console.error('Request failed:', {
      url,
      status: error.response?.status,
      message: error.message,
      error
    });

    throw error;
  }
} 