import { ReactNode } from 'react';
import { Layout as AntLayout, Menu, Button, Avatar, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/Layout.module.css';
import { useAppSelector, useAppDispatch } from '@/store';
import { setAuth, setUser } from '@/store/slices/userSlice';

const { Header, Content, Footer } = AntLayout;

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.user);

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'home') {
      router.push('/');
    } else {
      router.push(`/${key}`);
    }
  };

  const handleLogout = () => {
    dispatch(setAuth(false));
    dispatch(setUser(null));
    router.push('/login');
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
    const items = [
      {
        key: 'home',
        label: '首页',
      },
      {
        key: 'docs',
        label: '文档',
      },
    ];

    if (isAuthenticated) {
      items.push({
        key: 'dashboard',
        label: '控制台',
      });
    }

    return items;
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
            <Link href="/">
              BizBrain
            </Link>
          </div>
          <Menu
            mode="horizontal"
            selectedKeys={[router.pathname === '/' ? 'home' : router.pathname.split('/')[1]]}
            className={styles.menu}
            items={getMenuItems()}
            onClick={handleMenuClick}
          />
          <div className={styles.userSection}>
            {isAuthenticated ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div className={styles.userInfo}>
                  <Avatar icon={<UserOutlined />} />
                  <span>{user?.username}</span>
                </div>
              </Dropdown>
            ) : (
              <>
                <Link href="/login">
                  <Button type="link" className={styles.loginButton}>
                    登录
                  </Button>
                </Link>
                <Link href="/register">
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