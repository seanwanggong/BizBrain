import React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ConfigProvider, Layout } from 'antd';
import 'antd/dist/antd.min.css';
import '@/styles/globals.css';
import AppHeader from '@/components/Header';
import { useRouter } from 'next/router';
import 'reactflow/dist/style.css';
import '@/styles/reactflow-overrides.css';

const { Content, Footer } = Layout;

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isPublicPage = ['/login', '/register', '/'].includes(router.pathname);

  return (
    <>
      <Head>
        <title>BizBrain - AI Agent协作平台</title>
        <meta name="description" content="BizBrain - 企业级AI Agent协作平台" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ConfigProvider>
        <Layout>
          <AppHeader />
          <Content style={{ 
            minHeight: 'calc(100vh - 64px - 70px)',
            paddingTop: 64
          }}>
            <Component {...pageProps} />
          </Content>
          <Footer style={{ 
            textAlign: 'center',
            background: '#f5f5f5',
            padding: '24px 50px',
            height: 70
          }}>
            BizBrain ©{new Date().getFullYear()} - AI Agent协作平台
          </Footer>
        </Layout>
      </ConfigProvider>
    </>
  );
} 