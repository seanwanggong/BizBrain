import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Statistic, Card } from 'antd';
import { 
  RobotOutlined, 
  BranchesOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { request } from '@/utils/request';
import styles from './index.module.css';

interface DashboardStats {
  total_tasks: number;
  running_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  scheduled_tasks: number;
  llm_tasks: number;
}

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    total_tasks: 0,
    running_tasks: 0,
    completed_tasks: 0,
    failed_tasks: 0,
    scheduled_tasks: 0,
    llm_tasks: 0
  });
  const [loading, setLoading] = useState(true);

  // 加载统计数据
  const loadStats = useCallback(async () => {
    try {
      const data = await request<DashboardStats>('/dashboard/stats');
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;
    let intervalId: NodeJS.Timeout | null = null;

    const fetchData = async () => {
      if (!isSubscribed) return;
      await loadStats();
    };

    // 立即执行一次
    fetchData();

    // 设置定时器，每30秒刷新一次
    intervalId = setInterval(fetchData, 30000);

    // 清理函数
    return () => {
      isSubscribed = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [loadStats]); // 依赖于 loadStats

  return (
    <DashboardLayout 
      title="控制台" 
      subtitle="任务执行统计"
    >
      <div className={styles.dashboard}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={8}>
            <Card className={styles.statsCard}>
              <Statistic
                title="总任务数"
                value={stats.total_tasks}
                prefix={<BranchesOutlined />}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className={styles.statsCard}>
              <Statistic
                title="运行中任务"
                value={stats.running_tasks}
                prefix={<ClockCircleOutlined />}
                loading={loading}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className={styles.statsCard}>
              <Statistic
                title="已完成任务"
                value={stats.completed_tasks}
                prefix={<CheckCircleOutlined />}
                loading={loading}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className={styles.statsCard}>
              <Statistic
                title="失败任务"
                value={stats.failed_tasks}
                prefix={<WarningOutlined />}
                loading={loading}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className={styles.statsCard}>
              <Statistic
                title="定时任务"
                value={stats.scheduled_tasks}
                prefix={<CalendarOutlined />}
                loading={loading}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className={styles.statsCard}>
              <Statistic
                title="Agent 数量"
                value={stats.llm_tasks}
                prefix={<RobotOutlined />}
                loading={loading}
                valueStyle={{ color: '#13c2c2' }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage; 