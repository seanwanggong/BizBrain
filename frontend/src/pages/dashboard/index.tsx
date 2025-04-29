import React from 'react';
import { Row, Col, Statistic, List, Button, Card } from 'antd';
import { ArrowUpOutlined, RobotOutlined, ApiOutlined, BookOutlined, UserOutlined, MessageOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import styles from './index.module.css';

const DashboardPage = () => {
  // 示例数据
  const recentActivities = [
    { id: 1, type: 'agent', title: '客服助手回答了新问题', time: '10分钟前' },
    { id: 2, type: 'workflow', title: '数据分析工作流执行完成', time: '30分钟前' },
    { id: 3, type: 'knowledge', title: '更新了产品知识库', time: '1小时前' },
  ];

  const quickActions = [
    { title: '创建新Agent', icon: <RobotOutlined />, path: '/agents/create' },
    { title: '设计工作流', icon: <ApiOutlined />, path: '/workflows/create' },
    { title: '管理知识库', icon: <BookOutlined />, path: '/knowledge' },
  ];

  return (
    <DashboardLayout 
      title="控制台" 
      subtitle="查看和管理您的所有资源"
    >
      <div className={styles.dashboard}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="总用户数"
                value={1234}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="对话总数"
                value={5678}
                prefix={<MessageOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="完成任务"
                value={890}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="处理中"
                value={123}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} className={styles.section}>
          <Col xs={24} lg={12}>
            <h3 className={styles.sectionTitle}>快捷操作</h3>
            <div className={styles.actionButton}>
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
                dataSource={quickActions}
                renderItem={item => (
                  <List.Item>
                    <Button
                      type="default"
                      icon={item.icon}
                      size="large"
                      block
                      onClick={() => window.location.href = item.path}
                    >
                      {item.title}
                    </Button>
                  </List.Item>
                )}
              />
            </div>
          </Col>

          <Col xs={24} lg={12}>
            <h3 className={styles.sectionTitle}>最近活动</h3>
            <div className={styles.listWrapper}>
              <List
                dataSource={recentActivities}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.title}
                      description={item.time}
                    />
                  </List.Item>
                )}
              />
            </div>
          </Col>
        </Row>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage; 