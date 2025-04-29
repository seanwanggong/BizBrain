import { Button } from 'antd';
import { useRouter } from 'next/router';
import styles from '../styles/404.module.css';

export default function Custom404() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>404</h1>
        <h2 className={styles.subtitle}>页面未找到</h2>
        <p className={styles.description}>抱歉，您访问的页面不存在</p>
        <Button type="primary" onClick={() => router.push('/')}>
          返回首页
        </Button>
      </div>
    </div>
  );
} 