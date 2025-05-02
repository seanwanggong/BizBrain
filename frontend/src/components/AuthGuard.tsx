import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector } from '@/store';

interface AuthGuardProps {
  children: React.ReactNode;
}

// 基础公开路径
const publicPaths = ['/', '/login', '/register'];

// 检查路径是否是公开的
const isPublicPath = (path: string) => {
  // 基础公开路径检查
  if (publicPaths.includes(path)) {
    return true;
  }
  
  // 文档相关路径检查（/docs 和 /docs/... 都允许访问）
  if (path.startsWith('/docs')) {
    return true;
  }

  return false;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useAppSelector((state) => state.user);

  useEffect(() => {
    setMounted(true);
    // 检查当前路径是否需要鉴权
    const currentPathIsPublic = isPublicPath(router.pathname);
    
    if (!isAuthenticated && !currentPathIsPublic) {
      router.replace('/login');
    }
  }, [isAuthenticated, router.pathname]);

  // 在客户端渲染之前返回 null
  if (!mounted) {
    return null;
  }

  // 如果是需要鉴权的页面且未登录，返回 null
  if (!isAuthenticated && !isPublicPath(router.pathname)) {
    return null;
  }

  return <div>{children}</div>;
} 