import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { useRouter } from 'next/router';
import styles from '@/styles/Auth.module.css';
import { request } from '@/utils/request';
import Link from 'next/link';

interface RegisterForm {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

interface RegisterResponse {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  is_superuser: boolean;
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: RegisterForm) => {
    try {
      setLoading(true);
      await request<RegisterResponse>('/api/v1/auth/register', {
        method: 'POST',
        data: {
          email: values.email,
          username: values.username,
          password: values.password,
        },
      });

      message.success('注册成功，请登录');
      router.push('/login');
    } catch (error: any) {
      message.error(error.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <h1 className={styles.title}>注册 BizBrain</h1>
        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
          className={styles.form}
        >
          <Form.Item
            name="email"
            label="邮箱"
            className={styles.formItem}
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input size="large" placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="username"
            label="用户名"
            className={styles.formItem}
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 2, message: '用户名长度至少为2位' },
              { max: 20, message: '用户名长度最多为20位' },
            ]}
          >
            <Input size="large" placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            className={styles.formItem}
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码长度至少为6位' },
            ]}
          >
            <Input.Password size="large" placeholder="请输入密码" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            className={styles.formItem}
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password size="large" placeholder="请再次输入密码" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              className={styles.submitButton}
            >
              注册
            </Button>
          </Form.Item>

          <div className={styles.footer}>
            <Link href="/login">
              已有账号？立即登录
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
} 