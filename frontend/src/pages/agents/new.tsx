import React from 'react';
import { Layout, Typography, message } from 'antd';
import { useRouter } from 'next/router';
import AgentForm from '@/components/AgentForm';
import { createAgent } from '@/utils/api';
import { AgentCreate } from '@/types/agent';

const { Title } = Typography;
const { Content } = Layout;

const NewAgentPage: React.FC = () => {
  const router = useRouter();

  const handleSubmit = async (values: AgentCreate) => {
    try {
      await createAgent(values);
      message.success('Agent created successfully');
      router.push('/agents');
    } catch (error) {
      message.error('Failed to create agent');
    }
  };

  const handleCancel = () => {
    router.push('/agents');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <Title level={2}>Create New Agent</Title>
        <AgentForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Content>
    </Layout>
  );
};

export default NewAgentPage; 