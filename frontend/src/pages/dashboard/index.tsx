import React from 'react';
import { Card, Row, Col, Statistic, List, Typography, Button } from 'antd';
import { ArrowUpOutlined, RobotOutlined, ApiOutlined, BookOutlined } from '@ant-design/icons';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import styles from '@/styles/Dashboard.module.css';

const { Title } = Typography;

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
    <DashboardLayout>
      <div className={styles.dashboard}>
        <Title level={2}>工作台</Title>
        
        <Row gutter={[24, 24]}>
          {/* 统计数据 */}
          <Col span={6}>
            <Card>
              <Statistic
                title="Agent总数"
                value={12}
                prefix={<RobotOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="今日对话"
                value={156}
                prefix={<ArrowUpOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="工作流数"
                value={8}
                prefix={<ApiOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="知识库数量"
                value={5}
                prefix={<BookOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
          {/* 快捷操作 */}
          <Col span={12}>
            <Card title="快捷操作">
              <List
                grid={{ gutter: 16, column: 3 }}
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
            </Card>
          </Col>

          {/* 最近活动 */}
          <Col span={12}>
            <Card title="最近活动">
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
            </Card>
          </Col>
        </Row>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage; 