import React from 'react';
import { Button, Result } from 'antd';
import { useRouter } from 'next/router';

const NotFoundPage = () => {
  const router = useRouter();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 64px - 70px)',
      background: '#f5f5f5'
    }}>
      <Result
        status="404"
        title="404"
        subTitle="抱歉，您访问的页面不存在"
        extra={[
          <Button type="primary" key="home" onClick={() => router.push('/')}>
            返回首页
          </Button>,
          <Button key="back" onClick={() => router.back()}>
            返回上一页
          </Button>,
        ]}
      />
    </div>
  );
};

export default NotFoundPage; 