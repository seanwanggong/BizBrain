import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Badge } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import styles from '@/styles/WorkflowDesigner.module.css';

interface CustomNodeData {
  label: string;
  description: string;
  type?: string;
  status?: 'running' | 'completed' | 'pending';
}

const handleStyle = {
  width: '8px',
  height: '8px',
  background: '#1890ff',
  border: '2px solid white',
};

const CustomNode = ({ data }: { data: CustomNodeData }) => {
  return (
    <div className={`${styles.customNode} ${styles[`status-${data.status || 'pending'}`]}`}>
      <Handle
        type="target"
        position={Position.Top}
        className={styles.flowHandle}
      />
      <div className={styles.nodeContent}>
        {data.type && (
          <Badge 
            className={styles.nodeType}
            count={data.type} 
            style={{ backgroundColor: '#1890ff' }} 
          />
        )}
        <div className={styles.nodeLabel}>
          {data.label}
          {data.status === 'completed' && (
            <CheckCircleOutlined className={styles.completedIcon} />
          )}
        </div>
        <div className={styles.nodeDescription}>{data.description}</div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className={styles.flowHandle}
      />
    </div>
  );
};

export default memo(CustomNode); 