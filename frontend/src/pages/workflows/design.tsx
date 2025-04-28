import React, { useState, useEffect } from 'react';
import { Button, Space } from 'antd';
import { useRouter } from 'next/router';
import WorkflowDesigner from '@/components/WorkflowDesigner';
import styles from '@/styles/Workflows.module.css';
import { Node, Edge } from 'reactflow';

const DesignWorkflowPage: React.FC = () => {
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

  const handleDesignerChange = (newNodes: Node[], newEdges: Edge[]) => {
    setNodes(newNodes);
    setEdges(newEdges);
  };

  const handleSubmit = async () => {
    try {
      const workflowData = {
        name,
        description,
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
      };

      // TODO: 调用创建工作流的 API
      console.log('Creating workflow:', workflowData);
      router.push('/workflows');
    } catch (error) {
      console.error('Failed to create workflow:', error);
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
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" onClick={handleSubmit}>创建</Button>
        </Space>
      </div>
      <div className={styles.designContent}>
        <div style={{ width: '100%', height: '100%' }}>
          <WorkflowDesigner onChange={handleDesignerChange} />
        </div>
      </div>
    </div>
  );
};

export default DesignWorkflowPage; 