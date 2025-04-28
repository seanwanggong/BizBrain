import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Badge, Tooltip } from 'antd';
import { CheckCircleOutlined, FormOutlined } from '@ant-design/icons';
import styles from '@/styles/WorkflowDesigner.module.css';

interface CustomNodeData {
  label: string;
  description: string;
  type?: string;
  status?: 'running' | 'completed' | 'pending';
  config?: {
    formSchema?: {
      fields: Array<{
        name: string;
        label: string;
        type: string;
      }>;
    };
  };
  onDoubleClick?: (nodeId: string, nodeData: CustomNodeData) => void;
}

const CustomNode = memo(({ id, data, isConnectable }: NodeProps<CustomNodeData>) => {
  const isFormNode = data.type === 'form';
  const nodeClass = `${styles.customNode} ${isFormNode ? styles.formNode : ''}`;
  const formFieldsCount = data.config?.formSchema?.fields?.length || 0;

  const handleDoubleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Node double clicked:', id, data);
    if (data.onDoubleClick && isFormNode) {
      data.onDoubleClick(id, data);
    }
  };

  return (
    <div 
      className={nodeClass} 
      onDoubleClick={handleDoubleClick}
      style={{ cursor: isFormNode ? 'pointer' : 'default' }}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      
      <div style={{ marginBottom: '8px' }}>
        {isFormNode && (
          <Tooltip title={`已配置 ${formFieldsCount} 个字段`}>
            <Badge 
              count={formFieldsCount} 
              style={{ 
                backgroundColor: formFieldsCount > 0 ? '#52c41a' : '#d9d9d9',
                marginRight: '8px'
              }} 
            />
          </Tooltip>
        )}
        <span>{data.label}</span>
        {data.status === 'completed' && (
          <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: '4px' }} />
        )}
      </div>
      
      <div style={{ fontSize: '12px', color: '#666' }}>
        {data.description}
        {isFormNode && (
          <div style={{ 
            marginTop: '4px', 
            color: '#1890ff', 
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px' 
          }}>
            <FormOutlined />
            双击表单设置
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode; 