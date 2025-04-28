import React from 'react';
import { Result, Button } from 'antd';
import { useRouter } from 'next/router';

const Custom404 = () => {
  const router = useRouter();

  return (
    <Result
      status="404"
      title="404"
      subTitle="抱歉，您访问的页面不存在"
      extra={
        <Button type="primary" onClick={() => router.push('/')}>
          返回首页
        </Button>
      }
    />
  );
};

export default Custom404; 