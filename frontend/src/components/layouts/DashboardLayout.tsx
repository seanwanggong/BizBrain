import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Space } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { logout } from '@/utils/api';

const { Header, Content, Sider } = Layout;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => router.push('/profile')}>
        个人信息
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />} onClick={() => router.push('/settings')}>
        系统设置
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo" style={{ fontSize: '20px', fontWeight: 'bold' }}>
          BizBrain
        </div>
        <div>
          <Dropdown overlay={userMenu}>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>用户名</span>
            </Space>
          </Dropdown>
        </div>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={[router.pathname]}
            style={{ height: '100%', borderRight: 0 }}
          >
            <Menu.Item key="/dashboard" onClick={() => router.push('/dashboard')}>
              工作台
            </Menu.Item>
            <Menu.Item key="/agents" onClick={() => router.push('/agents')}>
              Agent 管理
            </Menu.Item>
            <Menu.Item key="/workflows" onClick={() => router.push('/workflows')}>
              工作流
            </Menu.Item>
            <Menu.Item key="/knowledge" onClick={() => router.push('/knowledge')}>
              知识库
            </Menu.Item>
            <Menu.Item key="/analytics" onClick={() => router.push('/analytics')}>
              数据分析
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content style={{ background: '#fff', padding: '24px', margin: 0, minHeight: 280 }}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout; 