import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { message } from 'antd';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && router.pathname !== '/login' && router.pathname !== '/register') {
      message.error('请先登录');
      router.push('/login');
    }
  }, [router.pathname]);

  return <>{children}</>;
};

export default ProtectedRoute; 