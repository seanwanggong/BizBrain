import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button, Space, message } from 'antd';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import WorkflowDesigner from '@/components/WorkflowDesigner';
import styles from '@/styles/Workflows.module.css';
import * as api from '@/utils/api';
import { Workflow } from '@/types/workflow';
import isEqual from 'lodash/isEqual';

const EditWorkflowPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [currentData, setCurrentData] = useState<{nodes: any[], edges: any[]} | null>(null);
  const [savedData, setSavedData] = useState<{nodes: any[], edges: any[]} | null>(null);

  useEffect(() => {
    if (id) {
      fetchWorkflow();
    }
  }, [id]);

  const fetchWorkflow = async () => {
    try {
      const data = await api.getWorkflow(id as string);
      setWorkflow(data);
      const initialData = {
        nodes: data.config?.nodes || [],
        edges: data.config?.edges || []
      };
      setCurrentData(initialData);
      setSavedData(initialData);
    } catch (error) {
      message.error('获取工作流失败');
    } finally {
      setLoading(false);
    }
  };

  // 检查是否有实际的数据变化
  const checkForChanges = (newData: {nodes: any[], edges: any[]}) => {
    if (!savedData) return false;

    // 比较节点数据（忽略位置信息的微小变化）
    const normalizeNodes = (nodes: any[]) => nodes.map(node => ({
      ...node,
      position: {
        x: Math.round(node.position.x),
        y: Math.round(node.position.y)
      }
    }));

    const normalizedCurrentNodes = normalizeNodes(newData.nodes);
    const normalizedSavedNodes = normalizeNodes(savedData.nodes);

    return !isEqual(normalizedCurrentNodes, normalizedSavedNodes) || 
           !isEqual(newData.edges, savedData.edges);
  };

  const handleSave = async () => {
    if (!workflow || !currentData || !hasChanges) return;
    
    setSaving(true);
    try {
      const updateData = {
        name: workflow.name,
        description: workflow.description,
        nodes: [], // Required by WorkflowFormData
        config: {
          nodes: currentData.nodes.map(node => ({
            id: node.id,
            type: node.data.type,
            name: node.data.label,
            description: node.data.description || '',
            config: {
              ...node.data.config,
              description: node.data.description || '',
            },
            position: node.position,
          })),
          edges: currentData.edges.map(edge => ({
            source: edge.source,
            target: edge.target,
            type: edge.type,
          })),
        }
      };
      
      await api.updateWorkflow(id as string, updateData);
      setSavedData(currentData);
      setHasChanges(false);
      message.success('保存成功');
    } catch (error) {
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDesignerChange = ({ nodes, edges }: { nodes: any[]; edges: any[] }) => {
    if (!workflow) return;
    const newData = { nodes, edges };
    setCurrentData(newData);
    setHasChanges(checkForChanges(newData));
  };

  const handleBack = () => {
    if (hasChanges) {
      const confirmed = window.confirm('有未保存的更改，确定要离开吗？');
      if (!confirmed) {
        return;
      }
    }
    // 使用 replace 并强制刷新页面
    router.replace('/workflows/').then(() => {
      window.location.reload();
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="编辑工作流">
        <div>加载中...</div>
      </DashboardLayout>
    );
  }

  if (!workflow) {
    return (
      <DashboardLayout title="编辑工作流">
        <div>工作流不存在</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="编辑工作流"
      subtitle={workflow.name}
    >
      <div className={styles.designContainer}>
        <div className={styles.designHeader}>
          <div className={styles.designTitle}>
            <h2>{workflow.name}</h2>
            <span className={styles.designDescription}>{workflow.description}</span>
          </div>
          <Space>
            <Button 
              type="primary"
              onClick={handleSave}
              loading={saving}
              disabled={!hasChanges}
            >
              保存
            </Button>
            <Button onClick={handleBack}>
              返回
            </Button>
            {hasChanges && <span style={{ color: '#faad14' }}>有未保存的更改</span>}
          </Space>
        </div>

        <div className={styles.designContent}>
          <WorkflowDesigner
            initialNodes={workflow.config?.nodes || []}
            initialEdges={workflow.config?.edges || []}
            onChange={handleDesignerChange}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditWorkflowPage; 