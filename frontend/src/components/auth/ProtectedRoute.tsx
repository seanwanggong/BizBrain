import { useEffect, ReactNode, useState } from 'react';
import { useRouter } from 'next/router';
import { message, Spin } from 'antd';
import { getCurrentUser } from '@/utils/api';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('请先登录');
        const returnUrl = encodeURIComponent(router.asPath);
        router.push(`/login?returnUrl=${returnUrl}`);
        return;
      }

      try {
        await getCurrentUser();
        setIsValidating(false);
      } catch (error) {
        message.error('登录已过期，请重新登录');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        const returnUrl = encodeURIComponent(router.asPath);
        router.push(`/login?returnUrl=${returnUrl}`);
      }
    };

    validateAuth();
  }, [router.pathname, router.asPath]);

  if (isValidating) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 