import { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import styles from '@/styles/Auth.module.css';

interface RegisterForm {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const onFinish = async (values: RegisterForm) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      await register(values.username, values.email, values.password);
      message.success('注册成功');
      router.push('/login');
    } catch (error) {
      message.error('注册失败：' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <Card title="注册" className={styles.card}>
          <Form
            name="register"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input size="large" placeholder="请输入邮箱" />
            </Form.Item>

            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input size="large" placeholder="请输入用户名" />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码长度至少为6个字符' }
              ]}
            >
              <Input.Password size="large" placeholder="请输入密码" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认密码"
              rules={[
                { required: true, message: '请确认密码' },
                { min: 6, message: '密码长度至少为6个字符' }
              ]}
            >
              <Input.Password size="large" placeholder="请再次输入密码" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className={styles.submitButton}
              >
                注册
              </Button>
            </Form.Item>
          </Form>
          
          <div className={styles.links}>
            已有账号？<Link href="/login">立即登录</Link>
          </div>
        </Card>
      </div>
    </Layout>
  );
} 