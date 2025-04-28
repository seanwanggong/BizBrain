import React from 'react';
import { Form, Input, Button, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/Auth.module.css';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = (values: any) => {
    console.log('Login values:', values);
    // TODO: Implement login logic
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card} title="登录">
        <Form
          name="login"
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

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form.Item>

          <div className={styles.links}>
            <Button type="link" onClick={() => navigate('/auth/register')}>
              注册账号
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login; 