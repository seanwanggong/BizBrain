import React, { useEffect, useState } from 'react';
import { Card, Typography, Tag, Space, Button, Descriptions, message } from 'antd';
import { useRouter } from 'next/router';
import { EditOutlined, PlayCircleOutlined } from '@ant-design/icons';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { getAgent } from '@/utils/api';
import { Agent } from '@/types/agent';
import styles from './index.module.css';

const { Title } = Typography;

const AgentDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAgent = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getAgent(id as string);
      setAgent(data);
    } catch (error) {
      message.error('获取Agent详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAgent();
    }
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="Agent详情">
        <Card loading={true} />
      </DashboardLayout>
    );
  }

  if (!agent) {
    return (
      <DashboardLayout title="Agent详情">
        <Card>
          <div className={styles.notFound}>Agent不存在</div>
        </Card>
      </DashboardLayout>
    );
  }

  const extra = (
    <Space>
      <Button
        icon={<EditOutlined />}
        onClick={() => router.push(`/agents/${id}/edit`)}
      >
        编辑
      </Button>
      <Button
        type="primary"
        icon={<PlayCircleOutlined />}
        onClick={() => router.push(`/agents/${id}/execute`)}
      >
        执行
      </Button>
    </Space>
  );

  return (
    <DashboardLayout
      title="Agent详情"
      subtitle={agent.name}
      extra={extra}
    >
      <div className={styles.agentDetail}>
        <Card>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="名称" span={2}>
              {agent.name}
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>
              {agent.description}
            </Descriptions.Item>
            <Descriptions.Item label="类型">
              {agent.agent_type}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={agent.is_active ? 'success' : 'default'}>
                {agent.is_active ? '运行中' : '已停止'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {agent.created_at}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {agent.updated_at}
            </Descriptions.Item>
            <Descriptions.Item label="配置信息" span={2}>
              <pre className={styles.configPre}>
                {JSON.stringify(agent.config, null, 2)}
              </pre>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AgentDetailPage; 