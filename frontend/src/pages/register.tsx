import React from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { useRouter } from 'next/router';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import styles from '@/styles/Auth.module.css';

const { Title, Text } = Typography;

const RegisterPage = () => {
  const router = useRouter();

  const handleRegister = async (values: any) => {
    try {
      // 这里应该是你的注册逻辑
      console.log('Register values:', values);
      router.push('/login', undefined, { shallow: true });
    } catch (error) {
      console.error('Register failed:', error);
    }
  };

  const handleLogin = () => {
    router.push('/login', undefined, { shallow: true });
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
          <Title level={2}>创建账号</Title>
          <Text type="secondary">加入我们，开启智能商业之旅</Text>
          <Form
            name="register"
            onFinish={handleRegister}
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
              label="邮箱"
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
              className={styles.formItem}
            >
              <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码长度至少为6位' }
              ]}
              className={styles.formItem}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
            </Form.Item>

            <Form.Item
              label="确认密码"
              name="confirmPassword"
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
              className={styles.formItem}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="请确认密码" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block className={styles.submitButton}>
                注册
              </Button>
            </Form.Item>

            <Form.Item>
              <Button type="link" onClick={handleLogin} block className={styles.linkButton}>
                已有账号？立即登录
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 