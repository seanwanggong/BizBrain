import React, { useEffect, useState } from 'react';
import { Layout, Typography, Input, Button, Card, message, Space } from 'antd';
import { useRouter } from 'next/router';
import { getAgent, executeAgent } from '@/utils/api';
import { Agent, AgentExecution } from '@/types/agent';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Content } = Layout;

const ExecuteAgentPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [input, setInput] = useState('');
  const [execution, setExecution] = useState<AgentExecution | null>(null);

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

  const handleExecute = async () => {
    if (!input.trim()) {
      message.warning('Please enter some input');
      return;
    }

    try {
      setExecuting(true);
      const result = await executeAgent(Number(id), input);
      setExecution(result);
      message.success('Execution completed');
    } catch (error) {
      message.error('Failed to execute agent');
    } finally {
      setExecuting(false);
    }
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
        <Title level={2}>Execute Agent</Title>
        
        <Card title="Agent Details" style={{ marginBottom: '24px' }}>
          <Space direction="vertical">
            <Text><strong>Name:</strong> {agent.name}</Text>
            <Text><strong>Type:</strong> {agent.type}</Text>
            <Text><strong>Description:</strong> {agent.description}</Text>
          </Space>
        </Card>

        <Card title="Input" style={{ marginBottom: '24px' }}>
          <TextArea
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your input here..."
            style={{ marginBottom: '16px' }}
          />
          <Button
            type="primary"
            onClick={handleExecute}
            loading={executing}
          >
            Execute
          </Button>
        </Card>

        {execution && (
          <Card title="Execution Result">
            <Space direction="vertical">
              <Text><strong>Status:</strong> {execution.status}</Text>
              <Text><strong>Output:</strong></Text>
              <TextArea
                value={execution.output}
                rows={6}
                readOnly
              />
            </Space>
          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default ExecuteAgentPage; 