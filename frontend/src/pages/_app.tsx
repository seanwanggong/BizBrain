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
          <title>【BizBrain】AI Agent协作平台 - 智能协同解决方案，企业降本增效新引擎</title>
          <meta name="description" content="BizBrain为企业提供智能化AI Agent协同管理平台，通过AI智能体深度协作优化工作流程，降低30%运营成本，提升跨部门协作效率，实现业务流程自动化与决策智能化升级。" />
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
        <div id="app-root">
          <Layout>
            <AuthGuard>
              <Component {...pageProps} />
            </AuthGuard>
          </Layout>
        </div>
      </ConfigProvider>
    </Provider>
  )
} 