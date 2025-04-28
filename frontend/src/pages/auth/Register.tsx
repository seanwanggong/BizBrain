import React from 'react';
import { Form, Input, Button, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/Auth.module.css';

const Register: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = (values: any) => {
    console.log('Register values:', values);
    // TODO: Implement register logic
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card} title="注册">
        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password />
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
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              注册
            </Button>
          </Form.Item>

          <div className={styles.links}>
            <Button type="link" onClick={() => navigate('/auth/login')}>
              返回登录
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register; 