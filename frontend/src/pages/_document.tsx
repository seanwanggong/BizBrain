import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="zh">
      <Head>
        {/* 预加载关键样式 */}
        <link
          rel="preload"
          href="/_next/static/css/antd.min.css"
          as="style"
        />
        <link
          rel="preload"
          href="/_next/static/css/globals.css"
          as="style"
        />
        
        {/* 添加内联样式以防止闪烁 */}
        <style dangerouslySetInnerHTML={{
          __html: `
            body {
              margin: 0;
              padding: 0;
            }
            .ant-layout-header {
              background: #fff !important;
              height: 64px;
              padding: 0 50px;
              line-height: 64px;
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