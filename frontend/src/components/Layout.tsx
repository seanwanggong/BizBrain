import { ReactNode, useEffect, useState } from 'react';
import { Layout as AntLayout, Menu, Button, Avatar, Dropdown, message } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/Layout.module.css';
import { useAppSelector, useAppDispatch } from '@/store';
import { logout } from '@/store/slices/userSlice';

const { Header, Content, Footer } = AntLayout;

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMenuClick = async ({ key }: { key: string }) => {
    if (!isAuthenticated && ['dashboard', 'agents', 'workflows', 'knowledge'].includes(key)) {
      message.warning('请先登录');
      await router.push('/login');
      return;
    }

    if (key === 'home') {
      await router.push('/');
    } else {
      await router.push(`/${key}`);
    }
  };

  const handleLogout = async () => {
    dispatch(logout());
    await router.push('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const getMenuItems = () => {
    if (!mounted) {
      return []; // 在客户端渲染之前返回空数组
    }

    if (isAuthenticated) {
      return [
        {
          key: 'dashboard',
          label: '控制台',
        },
        {
          key: 'agents',
          label: 'Agent系统',
        },
        {
          key: 'workflows',
          label: '工作流',
        },
        {
          key: 'tasks',
          label: '任务',
        },
        {
          key: 'executions',
          label: '执行',
        }
      ];
    }

    return [
      {
        key: 'home',
        label: '首页',
      },
      {
        key: 'docs',
        label: '文档',
      },
    ];
  };

  return (
    <AntLayout className={styles.layout}>
      <Header className={styles.header}>
        <div className={styles.logo}>
          <Link href="/" onClick={(e) => {
            e.preventDefault();
            router.push('/');
          }}>BizBrain</Link>
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[router.pathname.split('/')[1] || 'home']}
          items={getMenuItems()}
          onClick={handleMenuClick}
          className={styles.menu}
        />
        {mounted && isAuthenticated && (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Avatar icon={<UserOutlined />} />
          </Dropdown>
        )}
        {mounted && !isAuthenticated && (
          <div className={styles.authButtons}>
            <Button type="link" onClick={async () => {
              await router.push('/login');
            }}>登录</Button>
            <Button type="primary" onClick={async () => {
              await router.push('/register');
            }}>注册</Button>
          </div>
        )}
      </Header>
      <div className={styles.content}>
        <div className={styles.contentInner}>
          {children}
        </div>
      </div>
      <Footer className={styles.footer}>
        BizBrain ©{new Date().getFullYear()} Created by Your Team
      </Footer>
    </AntLayout>
  );
} 