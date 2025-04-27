import React from 'react';
import { Layout, Menu, Button, Space } from 'antd';
import { useRouter } from 'next/router';
import Link from 'next/link';

const { Header, Content, Footer } = Layout;

interface Props {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: Props) {
  const router = useRouter();

  return (
    <Layout>
      <Header style={{ 
        background: '#fff', 
        borderBottom: '1px solid #f0f0f0',
        padding: '0 50px',
        position: 'fixed',
        width: '100%',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center'
        }}>
          <Link href="/" style={{ 
            display: 'flex', 
            alignItems: 'center',
            marginRight: 40
          }}>
            <img 
              src="/logo.png" 
              alt="BizBrain Logo" 
              style={{ height: 32, marginRight: 8 }} 
            />
            <span style={{ 
              fontSize: 20, 
              fontWeight: 600,
              background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              BizBrain
            </span>
          </Link>
          <Menu
            mode="horizontal"
            selectedKeys={[router.pathname]}
            style={{ 
              border: 'none',
              flex: 1
            }}
          >
            <Menu.Item key="/">
              <Link href="/">首页</Link>
            </Menu.Item>
            <Menu.Item key="/docs">
              <Link href="/docs">文档</Link>
            </Menu.Item>
            <Menu.Item key="/about">
              <Link href="/about">关于我们</Link>
            </Menu.Item>
          </Menu>
        </div>
        <Space>
          <Link href="/login">
            <Button>登录</Button>
          </Link>
          <Link href="/register">
            <Button type="primary">注册</Button>
          </Link>
        </Space>
      </Header>
      <Content style={{ 
        marginTop: 64,
        minHeight: 'calc(100vh - 64px - 70px)'
      }}>
        {children}
      </Content>
      <Footer style={{ 
        textAlign: 'center',
        background: '#f5f5f5',
        padding: '24px 50px',
        height: 70
      }}>
        BizBrain ©{new Date().getFullYear()} - AI Agent协作平台
      </Footer>
    </Layout>
  );
} 