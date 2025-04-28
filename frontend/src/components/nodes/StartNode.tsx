import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import styles from '@/styles/WorkflowDesigner.module.css';

interface StartNodeData {
  label: string;
  description: string;
}

const StartNode = ({ data }: { data: StartNodeData }) => {
  return (
    <div className={styles.startNode}>
      <Handle
        type="source"
        position={Position.Top}
        className={styles.flowHandle}
        id="top"
      />
      <div className={styles.nodeContent}>
        <div className={styles.nodeLabel}>{data.label}</div>
        <div className={styles.nodeDescription}>{data.description}</div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className={styles.flowHandle}
        id="bottom"
      />
      <Handle
        type="source"
        position={Position.Right}
        className={styles.flowHandle}
        id="right"
      />
      <Handle
        type="source"
        position={Position.Left}
        className={styles.flowHandle}
        id="left"
      />
    </div>
  );
};

export default memo(StartNode); 