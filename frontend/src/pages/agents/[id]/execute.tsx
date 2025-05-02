import React, { useEffect, useState } from 'react';
import { Layout, Typography, Input, Button, Card, message, Space, Tag } from 'antd';
import { useRouter } from 'next/router';
import { getAgent, executeAgent } from '@/utils/api';
import { Agent, AgentExecution } from '@/types/agent';
import { PlayCircleOutlined, LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import styles from './execute.module.css';

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
      const data = await getAgent(id as string);
      setAgent(data);
    } catch (error) {
      message.error('获取Agent信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!input.trim()) {
      message.warning('请输入执行内容');
      return;
    }

    try {
      setExecuting(true);
      const result = await executeAgent(id as string, input);
      setExecution(result);
      message.success('执行完成');
    } catch (error) {
      message.error('执行失败');
    } finally {
      setExecuting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined />;
      case 'running':
        return <LoadingOutlined />;
      case 'failed':
        return <CloseCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'running':
        return 'processing';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'running':
        return '执行中';
      case 'failed':
        return '失败';
      default:
        return '等待中';
    }
  };

  if (loading) {
    return <div className={styles.loading}>加载中...</div>;
  }

  if (!agent) {
    return <div className={styles.notFound}>未找到Agent</div>;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content className={styles.executePage}>
        <div className={styles.header}>
          <Title level={2}>执行Agent</Title>
          <Text type="secondary">输入指令，让Agent开始工作</Text>
        </div>
        
        <div className={styles.contentLayout}>
          <div className={styles.leftColumn}>
            <Card title="Agent信息" className={styles.agentCard}>
              <div className={styles.cardContent}>
                <div className={styles.agentInfo}>
                  <div className={styles.agentInfoItem}>
                    <span className={styles.agentInfoLabel}>名称：</span>
                    <Text className={styles.agentInfoValue}>{agent.name}</Text>
                  </div>
                  <div className={styles.agentInfoItem}>
                    <span className={styles.agentInfoLabel}>类型：</span>
                    <Text className={styles.agentInfoValue}>{agent.agent_type}</Text>
                  </div>
                  <div className={styles.agentInfoItem}>
                    <span className={styles.agentInfoLabel}>描述：</span>
                    <Text className={styles.agentInfoValue}>{agent.description}</Text>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className={styles.rightColumn}>
            <Card title="执行输入" className={styles.inputCard}>
              <div className={styles.cardContent}>
                <div className={styles.executeSection}>
                  <TextArea
                    rows={12}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="请输入要执行的内容..."
                    className={styles.inputArea}
                  />
                  <div className={styles.buttonContainer}>
                    <Button
                      type="primary"
                      onClick={handleExecute}
                      loading={executing}
                      className={styles.executeButton}
                      icon={executing ? <LoadingOutlined /> : <PlayCircleOutlined />}
                    >
                      {executing ? '执行中...' : '开始执行'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {execution && (
              <Card title="执行结果" className={styles.resultCard}>
                <div className={styles.cardContent}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div className={styles.agentInfoItem}>
                      <span className={styles.agentInfoLabel}>状态：</span>
                      <Tag 
                        color={getStatusColor(execution.status)} 
                        className={styles.statusTag}
                        icon={getStatusIcon(execution.status)}
                      >
                        {getStatusText(execution.status)}
                      </Tag>
                    </div>
                    <div className={styles.agentInfoItem}>
                      <span className={styles.agentInfoLabel}>输出：</span>
                    </div>
                    <div className={styles.resultOutput}>
                      {execution.output}
                    </div>
                  </Space>
                </div>
              </Card>
            )}
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default ExecuteAgentPage; 