import '@/styles/antd.css'
import '@/styles/globals.css'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Provider } from 'react-redux'
import { store } from '@/store'
import Layout from '@/components/Layout'
import AuthGuard from '@/components/AuthGuard'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
          },
          components: {
            Layout: {
              headerBg: '#fff',
              headerHeight: 64,
              headerPadding: '0 24px',
              headerColor: 'rgba(0, 0, 0, 0.85)',
            },
            Menu: {
              horizontalItemSelectedColor: '#1890ff',
              horizontalItemHoverColor: '#1890ff',
              horizontalItemSelectedBg: 'transparent',
            },
          },
        }}
        locale={zhCN}
      >
        <Head>
          <title>BizBrain</title>
          <meta name="description" content="BizBrain - 智能商业助手" />
          <link rel="icon" href="/favicon.ico" />
          <style>{`
            .ant-layout-header {
              background: #fff !important;
              height: 64px !important;
              line-height: 64px !important;
              padding: 0 24px !important;
              position: fixed !important;
              width: 100% !important;
              z-index: 1000 !important;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
              display: flex !important;
              align-items: center !important;
              justify-content: space-between !important;
              border-bottom: 1px solid #f0f0f0 !important;
            }
            .ant-layout-content {
              margin-top: 64px !important;
            }
          `}</style>
        </Head>
        <Layout>
          <AuthGuard>
            <Component {...pageProps} />
          </AuthGuard>
        </Layout>
      </ConfigProvider>
    </Provider>
  )
} 