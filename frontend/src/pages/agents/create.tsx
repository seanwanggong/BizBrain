import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Card, message } from 'antd';
import AgentForm from '@/components/AgentForm';
import { AgentFormData } from '@/types/agent';
import styles from './create.module.css';

const CreateAgent: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: AgentFormData) => {
    setLoading(true);
    try {
      // TODO: 替换为实际的API调用
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('创建失败');
      }

      message.success('创建成功');
      router.push('/agents');
    } catch (error) {
      console.error('Failed to create agent:', error);
      message.error('创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card title="创建 Agent">
        <AgentForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/agents')}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default CreateAgent; 