import React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import '@/styles/globals.css';
import AppLayout from '@/components/Layout';
import { useRouter } from 'next/router';

const publicPaths = ['/', '/login', '/register'];

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isPublicPath = publicPaths.includes(router.pathname);

  // Check authentication
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && !isPublicPath) {
      router.push('/login');
    }
  }, [router.pathname]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
            colorSuccess: '#52c41a',
            colorWarning: '#faad14',
            colorError: '#f5222d',
            colorInfo: '#1890ff',
            borderRadius: 6,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          },
          components: {
            Button: {
              borderRadius: 6,
            },
            Card: {
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            },
            Table: {
              borderRadius: 12,
            },
            Input: {
              borderRadius: 6,
            },
            Select: {
              borderRadius: 6,
            },
          },
        }}
      >
        {isPublicPath ? (
          <Component {...pageProps} />
        ) : (
          <AppLayout>
            <Component {...pageProps} />
          </AppLayout>
        )}
      </ConfigProvider>
    </>
  );
}

export default MyApp; 