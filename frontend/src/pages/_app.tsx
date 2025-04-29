import '@/styles/antd.css'
import '@/styles/globals.css'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/store'
import Layout from '@/components/Layout'
import { setAuth, setUser } from '@/store/slices/userSlice'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        store.dispatch(setAuth(true))
        store.dispatch(setUser(user))
      } catch (error) {
        console.error('Failed to parse user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    
    setMounted(true)
  }, [])

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
              transition: none !important;
            }
            .ant-layout-content {
              margin-top: 64px !important;
            }
          `}</style>
        </Head>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ConfigProvider>
    </Provider>
  )
} 