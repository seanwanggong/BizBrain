import React, { useMemo } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ConfigProvider, Layout } from 'antd';
import { StyleProvider, createCache, extractStyle } from '@ant-design/cssinjs';
import '@/styles/globals.css';
import '@/styles/antd.css';
import 'reactflow/dist/style.css';
import '@/styles/reactflow-overrides.css';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserProvider } from '@/contexts/UserContext';
import AppLayout from '@/components/Layout';
import 'antd/dist/reset.css';

const publicPaths = ['/login', '/register', '/', '/docs'];

function App({ Component, pageProps, router }: AppProps) {
  const isPublicPath = publicPaths.includes(router.pathname);
  const cache = useMemo(() => createCache(), []);

  const content = isPublicPath ? (
    <Component {...pageProps} />
  ) : (
    <ProtectedRoute>
      <Component {...pageProps} />
    </ProtectedRoute>
  );

  return (
    <>
      <Head>
        <title>BizBrain - AI Agent协作平台</title>
        <meta name="description" content="BizBrain - 企业级AI Agent协作平台" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <style id="antd" dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }} />
      </Head>
      <StyleProvider cache={cache} hashPriority="high">
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#1890ff',
            },
          }}
        >
          <UserProvider>
            {router.pathname === '/login' || router.pathname === '/register' ? (
              content
            ) : (
              <AppLayout>{content}</AppLayout>
            )}
          </UserProvider>
        </ConfigProvider>
      </StyleProvider>
    </>
  );
}

export default App; 