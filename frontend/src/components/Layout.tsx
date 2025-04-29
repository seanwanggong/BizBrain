import { ReactNode } from 'react';
import { Layout as AntLayout, Menu, Button, Avatar, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/Layout.module.css';
import { useAuth } from '../hooks/useAuth';

const { Header, Content, Footer } = AntLayout;

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const userMenuItems = [
    {
      key: 'profile',
      label: <Link href="/profile">个人资料</Link>,
      icon: <UserOutlined />,
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: logout,
    },
  ];

  const getMenuItems = () => {
    if (user) {
      return [
        { 
          key: 'dashboard', 
          label: <Link href="/dashboard">控制台</Link>,
          onClick: (e: any) => e.domEvent.preventDefault()
        },
        { 
          key: 'agents', 
          label: <Link href="/agents">Agent</Link>,
          onClick: (e: any) => e.domEvent.preventDefault()
        },
        { 
          key: 'workflows', 
          label: <Link href="/workflows">工作流</Link>,
          onClick: (e: any) => e.domEvent.preventDefault()
        },
        { 
          key: 'knowledge', 
          label: <Link href="/knowledge">知识库</Link>,
          onClick: (e: any) => e.domEvent.preventDefault()
        },
      ];
    }
    return [
      { 
        key: 'home', 
        label: <Link href="/">首页</Link>,
        onClick: (e: any) => e.domEvent.preventDefault()
      },
      { 
        key: 'docs', 
        label: <Link href="/docs">文档</Link>,
        onClick: (e: any) => e.domEvent.preventDefault()
      },
    ];
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    if (router.pathname !== `/${key}`) {
      router.push(`/${key}`);
    }
  };

  return (
    <>
      <Head>
        <style>{`
          .ant-layout-header {
            background: #fff !important;
            height: 64px;
            padding: 0 50px;
            line-height: 64px;
          }
        `}</style>
      </Head>
      <AntLayout className={styles.layout}>
        <Header className={styles.header}>
          <div className={styles.brand}>
            <Link href="/" onClick={(e) => {
              if (router.pathname === '/') {
                e.preventDefault();
              }
            }}>
              BizBrain
            </Link>
          </div>
          <Menu
            mode="horizontal"
            selectedKeys={[router.pathname.split('/')[1] || 'home']}
            className={styles.menu}
            items={getMenuItems()}
            onClick={handleMenuClick}
          />
          <div className={styles.userSection}>
            {user ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div className={styles.userInfo}>
                  <Avatar icon={<UserOutlined />} />
                  <span>{user.username}</span>
                </div>
              </Dropdown>
            ) : (
              <>
                <Link href="/login" onClick={(e) => {
                  if (router.pathname === '/login') {
                    e.preventDefault();
                  }
                }}>
                  <Button type="link" className={styles.loginButton}>
                    登录
                  </Button>
                </Link>
                <Link href="/register" onClick={(e) => {
                  if (router.pathname === '/register') {
                    e.preventDefault();
                  }
                }}>
                  <Button type="primary" className={styles.registerButton}>
                    注册
                  </Button>
                </Link>
              </>
            )}
          </div>
        </Header>
        <Content className={styles.content}>
          <div className={styles.contentInner}>{children}</div>
        </Content>
        <Footer className={styles.footer}>
          BizBrain ©{new Date().getFullYear()} Created with{' '}
          <span className={styles.footerHeart}>❤</span>
        </Footer>
      </AntLayout>
    </>
  );
} 