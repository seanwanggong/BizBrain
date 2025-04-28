import React from 'react';
import { Layout, Menu, Button, Space } from 'antd';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/Header.module.css';

const { Header } = Layout;

const AppHeader = () => {
  const router = useRouter();

  return (
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
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', marginRight: '40px' }}>
          <Image 
            src="/logo.png" 
            alt="BizBrain Logo" 
            width={32}
            height={32}
            style={{ marginRight: 8 }} 
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
          style={{ border: 'none', background: 'transparent' }}
        >
          <Menu.Item key="/" className={styles.menuItem}>
            <Link href="/">首页</Link>
          </Menu.Item>
          
          <Menu.Item key="/agents" className={styles.menuItem}>
            <Link href="/agents">Agent 系统</Link>
          </Menu.Item>

          <Menu.Item key="/workflows" className={styles.menuItem}>
            <Link href="/workflows">工作流</Link>
          </Menu.Item>

          <Menu.Item key="/knowledge" className={styles.menuItem}>
            <Link href="/knowledge">知识库</Link>
          </Menu.Item>

          <Menu.Item key="/docs" className={styles.menuItem}>
            <Link href="/docs">文档</Link>
          </Menu.Item>
        </Menu>
      </div>

      <Space>
        <Button type="text" onClick={() => router.push('/login')}>登录</Button>
        <Button type="primary" onClick={() => router.push('/register')}>注册</Button>
      </Space>
    </Header>
  );
};

export default AppHeader; 