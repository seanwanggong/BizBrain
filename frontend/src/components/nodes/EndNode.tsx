import React from 'react';
import { Handle, Position } from 'reactflow';
import styles from '@/styles/WorkflowDesigner.module.css';

interface EndNodeData {
  label: string;
  description?: string;
}

const EndNode: React.FC<{ data: EndNodeData }> = ({ data }) => {
  return (
    <div className={styles.endNode}>
      <Handle
        type="target"
        position={Position.Top}
        className={styles.flowHandle}
        id="top"
      />
      <Handle
        type="target"
        position={Position.Left}
        className={styles.flowHandle}
        id="left"
      />
      <Handle
        type="target"
        position={Position.Right}
        className={styles.flowHandle}
        id="right"
      />
      <div className={styles.nodeContent}>
        <div className={styles.nodeLabel}>{data.label}</div>
        {data.description && (
          <div className={styles.nodeDescription}>{data.description}</div>
        )}
      </div>
    </div>
  );
};

export default EndNode; 