import { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/Auth.module.css';
import Layout from '../components/Layout';

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      const result = await login(values.email, values.password);
      if (result.success) {
        message.success('登录成功');
        router.push('/dashboard');
      } else {
        message.error(typeof result.error === 'string' ? result.error : '登录失败');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error(error instanceof Error ? error.message : '登录过程中发生错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <Card className={styles.card} title="登录">
          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            className={styles.form}
          >
            <Form.Item
              label="邮箱"
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码长度至少为6位' }
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className={styles.submitButton}
                loading={loading}
              >
                登录
              </Button>
            </Form.Item>

            <div className={styles.links}>
              <a onClick={() => router.push('/register')}>
                还没有账号？立即注册
              </a>
            </div>
          </Form>
        </Card>
      </div>
    </Layout>
  );
} 