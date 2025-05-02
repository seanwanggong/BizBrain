import React from 'react';
import { Layout } from 'antd';
import styles from '@/styles/DashboardLayout.module.css';

const { Content } = Layout;

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  extra?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, subtitle, extra }) => {
  return (
    <div className={styles.content}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{title}</h2>
            {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
          </div>
          {extra && <div className={styles.extra}>{extra}</div>}
        </div>
        <div className={styles.contentInner}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout; 