import React from 'react';
import { Layout, Menu, Button, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import styles from '@/styles/Navbar.module.css';

interface NavbarProps {
  isAuthenticated: boolean;
  user: {
    username: string;
    email: string;
  } | null;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, user }) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const userMenu = {
    items: [
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout,
      },
    ],
  };

  const menuItems = isAuthenticated
    ? [
        {
          key: 'dashboard',
          label: '控制台',
          onClick: () => router.push('/dashboard'),
        },
        {
          key: 'agent',
          label: 'Agent系统',
          onClick: () => router.push('/agent'),
        },
        {
          key: 'workflow',
          label: '工作流',
          onClick: () => router.push('/workflow'),
        },
      ]
    : [
        {
          key: 'home',
          label: '首页',
          onClick: () => router.push('/'),
        },
        {
          key: 'docs',
          label: '文档',
          onClick: () => router.push('/docs'),
        },
      ];

  return (
    <Layout.Header className={styles.header}>
      <div className={styles.logo}>BizBrain</div>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[router.pathname]}
        items={menuItems}
        className={styles.menu}
      />
      <div className={styles.userSection}>
        {isAuthenticated && user ? (
          <Dropdown menu={userMenu} placement="bottomRight">
            <Button type="text" icon={<UserOutlined />} className={styles.userButton}>
              {user.username}
            </Button>
          </Dropdown>
        ) : (
          <Button type="primary" onClick={() => router.push('/login')}>
            登录
          </Button>
        )}
      </div>
    </Layout.Header>
  );
};

export default Navbar; 