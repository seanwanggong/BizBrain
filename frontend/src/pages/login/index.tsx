import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import styles from '@/styles/Auth.module.css';
import Link from 'next/link';

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const onFinish = async (values: LoginForm) => {
    try {
      setLoading(true);
      console.log('Login attempt with:', values.email);
      const result = await login(values.email, values.password);
      console.log('Login result:', result);

      if (result.success) {
        message.success('登录成功');
      } else {
        message.error(result.error || '登录失败');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <h1 className={styles.title}>登录 BizBrain</h1>
        <Form
          name="login"
          onFinish={onFinish}
          className={styles.form}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="邮箱"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className={styles.submitButton}
              loading={loading}
              block
            >
              登录
            </Button>
          </Form.Item>

          <div className={styles.footer}>
            <Link href="/register">
              还没有账号？立即注册
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage; 