import React from 'react';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import { useRouter } from 'next/router';
import { 
  HomeOutlined,
  FileTextOutlined,
  DashboardOutlined,
  RobotOutlined,
  ApiOutlined,
  DatabaseOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import styles from '@/styles/Header.module.css';
import { useUser } from '@/contexts/UserContext';

const { Header } = Layout;

const AppHeader: React.FC = () => {
  const router = useRouter();
  const { user, setUser } = useUser();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ];

  const getMenuItems = () => {
    if (!user) {
      return [
        {
          key: 'home',
          icon: <HomeOutlined />,
          label: '首页',
          onClick: () => router.push('/')
        },
        {
          key: 'docs',
          icon: <FileTextOutlined />,
          label: '文档',
          onClick: () => router.push('/docs')
        }
      ];
    }

    return [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: '控制台',
        onClick: () => router.push('/dashboard')
      },
      {
        key: 'agent',
        icon: <RobotOutlined />,
        label: 'Agent系统',
        onClick: () => router.push('/agents')
      },
      {
        key: 'workflow',
        icon: <ApiOutlined />,
        label: '工作流',
        onClick: () => router.push('/workflows')
      },
      {
        key: 'knowledge',
        icon: <DatabaseOutlined />,
        label: '知识库',
        onClick: () => router.push('/knowledge')
      }
    ];
  };

  return (
    <Header className={styles.header}>
      <div className={styles.logo} onClick={() => router.push('/')}>
        BizBrain
      </div>
      
      <Menu
        mode="horizontal"
        selectedKeys={[router.pathname.split('/')[1] || 'home']}
        className={styles.mainMenu}
        items={getMenuItems()}
      />

      <div className={styles.rightSection}>
        {user ? (
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            className={styles.userDropdown}
          >
            <div className={styles.userInfo}>
              <Avatar
                size="small"
                icon={<UserOutlined />}
                src={user.avatar}
                className={styles.avatar}
              />
              <span className={styles.username}>{user.username}</span>
            </div>
          </Dropdown>
        ) : (
          <div className={styles.authButtons}>
            <Button
              type="text"
              className={styles.loginButton}
              onClick={() => router.push('/login')}
            >
              登录
            </Button>
            <Button
              type="primary"
              className={styles.registerButton}
              onClick={() => router.push('/register')}
            >
              注册
            </Button>
          </div>
        )}
      </div>
    </Header>
  );
};

export default AppHeader; 