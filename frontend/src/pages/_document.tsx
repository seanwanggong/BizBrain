import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="zh-CN">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{
          __html: `
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
          `
        }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 