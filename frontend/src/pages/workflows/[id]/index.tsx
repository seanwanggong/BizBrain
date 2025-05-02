import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button, Space, message } from 'antd';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import WorkflowDesigner from '@/components/WorkflowDesigner';
import styles from '@/styles/Workflows.module.css';
import * as api from '@/utils/api';
import { Workflow } from '@/types/workflow';

const WorkflowDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchWorkflow();
    }
  }, [id]);

  const fetchWorkflow = async () => {
    try {
      const data = await api.getWorkflow(id as string);
      setWorkflow(data);
    } catch (error) {
      message.error('获取工作流失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/workflows/${id}/edit`);
  };

  const handleBack = () => {
    router.push('/workflows');
  };

  if (loading) {
    return (
      <DashboardLayout title="工作流详情">
        <div>加载中...</div>
      </DashboardLayout>
    );
  }

  if (!workflow) {
    return (
      <DashboardLayout title="工作流详情">
        <div>工作流不存在</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="工作流详情"
      subtitle={workflow.name}
    >
      <div className={styles.designContainer}>
        <div className={styles.designHeader}>
          <div className={styles.designTitle}>
            <h2>{workflow.name}</h2>
            <span className={styles.designDescription}>{workflow.description}</span>
          </div>
          <Space>
            <Button onClick={handleBack}>
              返回
            </Button>
            <Button type="primary" onClick={handleEdit}>
              编辑
            </Button>
          </Space>
        </div>

        <div className={styles.designContent}>
          <WorkflowDesigner
            initialNodes={workflow.config?.nodes || []}
            initialEdges={workflow.config?.edges || []}
            readOnly
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WorkflowDetailPage; 