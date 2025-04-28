import React from 'react';
import { Card, Typography } from 'antd';
import {
  PlayCircleOutlined,
  RobotOutlined,
  BranchesOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import styles from '@/styles/NodeToolbar.module.css';

const { Text } = Typography;

const nodeTypes = [
  {
    type: 'start',
    label: '开始节点',
    icon: <PlayCircleOutlined />,
    description: '工作流的起点',
  },
  {
    type: 'agent',
    label: 'Agent 节点',
    icon: <RobotOutlined />,
    description: '执行 AI 代理任务',
  },
  {
    type: 'condition',
    label: '条件节点',
    icon: <BranchesOutlined />,
    description: '根据条件分支流程',
  },
  {
    type: 'action',
    label: '动作节点',
    icon: <ThunderboltOutlined />,
    description: '执行具体操作',
  },
  {
    type: 'end',
    label: '结束节点',
    icon: <CheckCircleOutlined />,
    description: '工作流的终点',
  },
];

interface NodeToolbarProps {
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

const NodeToolbar: React.FC<NodeToolbarProps> = ({ onDragStart }) => {
  return (
    <div className={styles.toolbar}>
      <Text strong className={styles.title}>节点类型</Text>
      <div className={styles.nodeList}>
        {nodeTypes.map((node) => (
          <Card
            key={node.type}
            className={styles.nodeItem}
            draggable
            onDragStart={(event) => onDragStart(event, node.type)}
          >
            <div className={styles.nodeIcon}>{node.icon}</div>
            <Text strong>{node.label}</Text>
            <Text type="secondary" className={styles.nodeDescription}>
              {node.description}
            </Text>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NodeToolbar; 