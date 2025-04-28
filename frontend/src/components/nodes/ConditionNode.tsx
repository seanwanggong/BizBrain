import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import styles from '@/styles/WorkflowDesigner.module.css';

interface ConditionNodeData {
  label: string;
  description: string;
}

const ConditionNode = ({ data }: { data: ConditionNodeData }) => {
  return (
    <div className={styles.conditionNode}>
      <Handle
        type="target"
        position={Position.Top}
        className={styles.flowHandle}
      />
      <div className={styles.nodeContent}>
        <div className={styles.nodeLabel}>{data.label}</div>
        <div className={styles.nodeDescription}>{data.description}</div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className={styles.flowHandle}
        id="true"
      />
      <Handle
        type="source"
        position={Position.Right}
        className={styles.flowHandle}
        id="false"
      />
    </div>
  );
};

export default memo(ConditionNode); 