import React, { useState, useEffect } from 'react';
import { Button, Space, message } from 'antd';
import { useRouter } from 'next/router';
import WorkflowDesigner from '@/components/WorkflowDesigner';
import styles from '@/styles/Workflows.module.css';
import { Node, Edge } from 'reactflow';
import * as api from '@/utils/api';

const CreateWorkflowPage: React.FC = () => {
  const router = useRouter();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const { name, description } = router.query;

  useEffect(() => {
    // 如果没有基本信息，返回列表页
    if (!name || !description) {
      router.replace('/workflows');
    }
  }, [name, description, router]);

  const handleDesignerChange = ({ nodes: newNodes, edges: newEdges }: { nodes: Node[]; edges: Edge[] }) => {
    setNodes(newNodes);
    setEdges(newEdges);
  };

  const handleSubmit = async () => {
    try {
      const workflowData = {
        name: name as string,
        description: description as string,
        nodes: nodes.map(node => ({
          type: node.data.type,
          name: node.data.label,
          config: node.data.config || {},
        })),
        config: {
          nodes: nodes.map(node => ({
            id: node.id,
            type: node.data.type,
            name: node.data.label,
            config: node.data.config || {},
            position: node.position,
          })),
          edges: edges.map(edge => ({
            source: edge.source,
            target: edge.target,
            type: edge.type,
          })),
        }
      };

      await api.createWorkflow(workflowData);
      message.success('工作流创建成功');
      router.push('/workflows');
    } catch (error: any) {
      console.error('Failed to create workflow:', error);
      let errorMessage = '创建工作流失败';
      
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          errorMessage = detail[0]?.msg || errorMessage;
        } else if (typeof detail === 'object') {
          errorMessage = detail.msg || errorMessage;
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        }
      }
      
      message.error(errorMessage);
    }
  };

  const handleCancel = () => {
    router.push('/workflows');
  };

  return (
    <div className={styles.designContainer}>
      <div className={styles.designHeader}>
        <div className={styles.designTitle}>
          <h2>{name}</h2>
          <span className={styles.designDescription}>{description}</span>
        </div>
        <Space>
          <Button onClick={handleCancel}>
            取消
          </Button>
          <Button type="primary" onClick={handleSubmit}>
            创建
          </Button>
        </Space>
      </div>

      <div className={styles.designContent}>
        <WorkflowDesigner onChange={handleDesignerChange} />
      </div>
    </div>
  );
};

export default CreateWorkflowPage; 