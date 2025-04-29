import React, { ReactNode } from 'react';
import { Card, Typography } from 'antd';
import styles from './DashboardLayout.module.css';

const { Title } = Typography;

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  extra?: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  extra
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Title level={2} className={styles.title}>{title}</Title>
          {subtitle && (
            <Typography.Text type="secondary" className={styles.subtitle}>
              {subtitle}
            </Typography.Text>
          )}
        </div>
        {extra && <div className={styles.extra}>{extra}</div>}
      </div>
      <Card className={styles.content}>
        {children}
      </Card>
    </div>
  );
};

export default DashboardLayout; 