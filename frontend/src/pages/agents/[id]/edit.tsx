import React, { useEffect, useState } from 'react';
import { Layout, Typography, message } from 'antd';
import { useRouter } from 'next/router';
import AgentForm from '@/components/AgentForm';
import { getAgent, updateAgent } from '@/utils/api';
import { Agent, AgentUpdate } from '@/types/agent';

const { Title } = Typography;
const { Content } = Layout;

const EditAgentPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAgent();
    }
  }, [id]);

  const fetchAgent = async () => {
    try {
      const data = await getAgent(Number(id));
      setAgent(data);
    } catch (error) {
      message.error('Failed to fetch agent');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: AgentUpdate) => {
    try {
      await updateAgent(Number(id), values);
      message.success('Agent updated successfully');
      router.push('/agents');
    } catch (error) {
      message.error('Failed to update agent');
    }
  };

  const handleCancel = () => {
    router.push('/agents');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!agent) {
    return <div>Agent not found</div>;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <Title level={2}>Edit Agent</Title>
        <AgentForm
          initialValues={agent}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEdit
        />
      </Content>
    </Layout>
  );
};

export default EditAgentPage; 