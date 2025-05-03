import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import AgentForm from '../../../components/AgentForm';
import { getAgent, updateAgent } from '@/utils/api';
import { Agent, AgentType } from '@/types/agent';

const EditAgentPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
      message.error('获取Agent失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!id) return;
    
    setSubmitting(true);
    try {
      await updateAgent(id as string, {
        name: values.name,
        description: values.description,
        agent_type: values.type,
        config: {
          model: values.config?.model || 'gpt-4',
          systemPrompt: values.config?.systemPrompt || '',
          temperature: values.config?.temperature || 0.7,
          maxTokens: values.config?.maxTokens || 2000,
          tools: values.config?.tools || []
        },
        is_active: true
      });
      message.success('Agent更新成功');
      router.replace('/agents/').then(() => {
        window.location.reload();
      });
    } catch (error) {
      message.error('更新Agent失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.replace('/agents/').then(() => {
      window.location.reload();
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="编辑Agent">
        <div>加载中...</div>
      </DashboardLayout>
    );
  }

  if (!agent) {
    return (
      <DashboardLayout title="编辑Agent">
        <div>Agent不存在</div>
      </DashboardLayout>
    );
  }

  // 转换数据格式以匹配表单结构
  const initialValues = {
    name: agent.name,
    description: agent.description,
    type: agent.agent_type as AgentType,
    config: {
      model: agent.config.model,
      systemPrompt: agent.config.systemPrompt,
      temperature: agent.config.temperature,
      maxTokens: agent.config.maxTokens,
      tools: agent.config.tools || []
    }
  };

  return (
    <DashboardLayout
      title="编辑Agent"
      subtitle={agent.name}
    >
      <AgentForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={submitting}
      />
    </DashboardLayout>
  );
};

export default EditAgentPage; 