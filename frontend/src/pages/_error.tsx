import React from 'react';
import { Result, Button } from 'antd';
import { useRouter } from 'next/router';
import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
}

const ErrorPage = ({ statusCode }: ErrorProps) => {
  const router = useRouter();

  return (
    <Result
      status={statusCode ? statusCode.toString() as any : 'error'}
      title={statusCode ? statusCode.toString() : 'Error'}
      subTitle="Sorry, something went wrong."
      extra={
        <Button type="primary" onClick={() => router.push('/')}>
          Back Home
        </Button>
      }
    />
  );
};

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage; 