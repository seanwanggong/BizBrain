import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { useRouter } from 'next/router';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import styles from '@/styles/Auth.module.css';
import { login } from '@/utils/api';

const { Title, Text } = Typography;

const LoginPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: { username: string; password: string }) => {
    try {
      setLoading(true);
      const response = await login(values);
      if (response.access_token) {
        localStorage.setItem('token', response.access_token);
        message.success('登录成功');
        router.push('/');
      } else {
        message.error('登录失败：' + (response.error || '未知错误'));
      }
    } catch (error) {
      console.error('Login failed:', error);
      message.error('登录失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    router.push('/register', undefined, { shallow: true });
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.logo}>
          <Title level={1}>BizBrain</Title>
          <Text type="secondary">智能商业助手，助力企业成长</Text>
        </div>
      </div>
      <div className={styles.rightPanel}>
        <div className={styles.content}>
          <Title level={2}>欢迎回来</Title>
          <Text type="secondary">请登录您的账号</Text>
          <Form
            name="login"
            onFinish={handleLogin}
            layout="vertical"
            className={styles.form}
          >
            <Form.Item
              label="用户名"
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
              className={styles.formItem}
            >
              <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
              className={styles.formItem}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block className={styles.submitButton} loading={loading}>
                登录
              </Button>
            </Form.Item>

            <Form.Item>
              <Button type="link" onClick={handleRegister} block className={styles.linkButton}>
                还没有账号？立即注册
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 