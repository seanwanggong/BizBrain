import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Dropdown, Space, Avatar } from 'antd';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

interface Props {
  children: React.ReactNode;
}

export default function AppLayout({ children }: Props) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    setIsLoggedIn(!!token);
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    router.push('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profile
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  const menuItems = [
    {
      key: '/',
      label: <Link href="/">Home</Link>,
    },
    {
      key: '/agents',
      label: <Link href="/agents">Agents</Link>,
    },
    {
      key: '/workflows',
      label: <Link href="/workflows">Workflows</Link>,
    },
    {
      key: '/tasks',
      label: <Link href="/tasks">Tasks</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
        <div style={{ float: 'left', color: 'white', marginRight: '24px' }}>
          BizBrain
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[router.pathname]}
          items={menuItems}
          style={{ float: 'left' }}
        />
        <div style={{ float: 'right', marginRight: '24px' }}>
          {isLoggedIn ? (
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Space style={{ cursor: 'pointer', color: 'white' }}>
                <Avatar icon={<UserOutlined />} />
                <span>{user?.name || 'User'}</span>
              </Space>
            </Dropdown>
          ) : (
            <Space>
              <Button type="link" onClick={() => router.push('/login')} style={{ color: 'white' }}>
                Login
              </Button>
              <Button type="primary" onClick={() => router.push('/register')}>
                Register
              </Button>
            </Space>
          )}
        </div>
      </Header>
      <Content style={{ padding: '0 50px', marginTop: 64 }}>
        <div style={{ padding: '24px', minHeight: 'calc(100vh - 64px - 70px)' }}>
          {children}
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        BizBrain ©{new Date().getFullYear()} Created with ❤️
      </Footer>
    </Layout>
  );
} 