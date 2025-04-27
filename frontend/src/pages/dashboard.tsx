import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Button, Space } from 'antd';
import { 
  RobotOutlined, 
  ApiOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { getAgents, getWorkflows, getTasks, getExecutions } from '@/utils/api';

const { Title } = Typography;

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    agents: 0,
    workflows: 0,
    tasks: 0,
    executions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [agents, workflows, tasks, executions] = await Promise.all([
        getAgents(),
        getWorkflows(),
        getTasks(),
        getExecutions()
      ]);
      setStats({
        agents: agents.length,
        workflows: workflows.length,
        tasks: tasks.length,
        executions: executions.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Agents"
              value={stats.agents}
              prefix={<RobotOutlined />}
              loading={loading}
            />
            <Button 
              type="link" 
              onClick={() => router.push('/agents')}
              style={{ marginTop: 16 }}
            >
              View Agents
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Workflows"
              value={stats.workflows}
              prefix={<ApiOutlined />}
              loading={loading}
            />
            <Button 
              type="link" 
              onClick={() => router.push('/workflows')}
              style={{ marginTop: 16 }}
            >
              View Workflows
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tasks"
              value={stats.tasks}
              prefix={<CheckCircleOutlined />}
              loading={loading}
            />
            <Button 
              type="link" 
              onClick={() => router.push('/tasks')}
              style={{ marginTop: 16 }}
            >
              View Tasks
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Executions"
              value={stats.executions}
              prefix={<ClockCircleOutlined />}
              loading={loading}
            />
            <Button 
              type="link" 
              onClick={() => router.push('/executions')}
              style={{ marginTop: 16 }}
            >
              View Executions
            </Button>
          </Card>
        </Col>
      </Row>
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Quick Actions">
            <Space>
              <Button 
                type="primary" 
                icon={<RobotOutlined />}
                onClick={() => router.push('/agents/new')}
              >
                Create Agent
              </Button>
              <Button 
                icon={<ApiOutlined />}
                onClick={() => router.push('/workflows/new')}
              >
                Create Workflow
              </Button>
              <Button 
                icon={<CheckCircleOutlined />}
                onClick={() => router.push('/tasks/new')}
              >
                Create Task
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
} 