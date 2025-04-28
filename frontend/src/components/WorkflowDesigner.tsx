import 'reactflow/dist/style.css';
import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  NodeTypes,
  ReactFlowInstance,
  Connection,
  Edge,
  addEdge,
  useEdgesState,
  useNodesState,
  Panel,
  ConnectionMode,
  MarkerType,
} from 'reactflow';
import styles from '@/styles/WorkflowDesigner.module.css';
import CustomNode from './nodes/CustomNode';
import StartNode from './nodes/StartNode';
import EndNode from '@/components/nodes/EndNode';
import ConditionNode from './nodes/ConditionNode';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
  start: StartNode,
  end: EndNode,
  condition: ConditionNode,
};

// 初始节点：添加一个开始节点
const initialNodes: Node[] = [
  {
    id: 'start-1',
    type: 'start',
    position: { x: 400, y: 50 },
    data: {
      label: '开始',
      description: '工作流的起点',
    },
  },
];

interface NodeType {
  type: string;
  label: string;
  description: string;
  category?: string;
  isSpecial?: boolean;
}

const nodeTypeList: NodeType[] = [
  // 基础节点
  {
    type: 'start',
    label: '开始节点',
    description: '工作流的起点',
    category: '基础节点',
    isSpecial: true
  },
  {
    type: 'end',
    label: '结束节点',
    description: '工作流的终点',
    category: '基础节点',
    isSpecial: true
  },
  
  // 数据采集节点
  {
    type: 'crawler',
    label: '网页爬虫',
    description: '自动抓取网页内容和数据',
    category: '数据采集'
  },
  {
    type: 'form',
    label: '表单收集',
    description: '创建和管理数据收集表单',
    category: '数据采集'
  },
  {
    type: 'api',
    label: 'API 集成',
    description: '连接外部 API 和服务',
    category: '数据采集'
  },
  
  // 内容处理节点
  {
    type: 'content_filter',
    label: '内容过滤',
    description: '过滤和清理采集的数据',
    category: '内容处理'
  },
  {
    type: 'content_transform',
    label: '内容转换',
    description: '转换数据格式和结构',
    category: '内容处理'
  },
  {
    type: 'content_enrich',
    label: '内容增强',
    description: '使用 AI 扩充和优化内容',
    category: '内容处理'
  },

  // 业务逻辑节点
  {
    type: 'condition',
    label: '条件判断',
    description: '根据条件选择不同的处理流程',
    category: '业务逻辑'
  },
  {
    type: 'loop',
    label: '循环处理',
    description: '重复执行特定的任务序列',
    category: '业务逻辑'
  },
  {
    type: 'delay',
    label: '延时等待',
    description: '设置处理延迟和等待时间',
    category: '业务逻辑'
  },

  // 数据存储节点
  {
    type: 'database',
    label: '数据库操作',
    description: '存储和查询数据库信息',
    category: '数据存储'
  },
  {
    type: 'file_storage',
    label: '文件存储',
    description: '管理文件的上传和存储',
    category: '数据存储'
  },
  {
    type: 'cache',
    label: '缓存管理',
    description: '处理数据缓存和更新',
    category: '数据存储'
  },

  // 通知和反馈节点
  {
    type: 'email',
    label: '邮件通知',
    description: '发送邮件通知和报告',
    category: '通知反馈'
  },
  {
    type: 'message',
    label: '消息推送',
    description: '发送站内消息或推送通知',
    category: '通知反馈'
  },
  {
    type: 'webhook',
    label: 'Webhook回调',
    description: '触发外部系统的回调通知',
    category: '通知反馈'
  }
];

// 按类别分组的节点类型
const groupedNodeTypes = nodeTypeList.reduce((acc, node) => {
  const category = node.category || '其他';
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category].push(node);
  return acc;
}, {} as Record<string, NodeType[]>);

interface WorkflowDesignerProps {
  onChange?: (nodes: Node[], edges: Edge[]) => void;
}

const WorkflowDesigner: React.FC<WorkflowDesignerProps> = ({ onChange }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // 当节点或边发生变化时通知父组件
  useEffect(() => {
    onChange?.(nodes, edges);
  }, [nodes, edges, onChange]);

  const onConnect = useCallback((params: Connection) => {
    // 验证连接是否有效
    const sourceNode = nodes.find(node => node.id === params.source);
    const targetNode = nodes.find(node => node.id === params.target);
    
    // 开始节点不能作为目标节点
    if (targetNode?.type === 'start') {
      return;
    }
    
    // 结束节点不能作为源节点
    if (sourceNode?.type === 'end') {
      return;
    }

    // 条件节点的特殊处理
    if (sourceNode?.type === 'condition') {
      // 为条件节点添加标签
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        label: params.sourceHandle === 'true' ? '是' : '否',
        labelStyle: { fill: '#666', fontWeight: 500 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#1890ff',
        },
        style: {
          stroke: '#1890ff',
          strokeWidth: 2,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    } else {
      // 普通连接
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#1890ff',
        },
        style: {
          stroke: '#1890ff',
          strokeWidth: 2,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    }
  }, [nodes]);

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const data = event.dataTransfer.getData('application/reactflow');
      
      try {
        const nodeType = JSON.parse(data) as NodeType;
        
        if (!reactFlowBounds || !reactFlowInstance) {
          return;
        }

        // 检查是否已经存在开始或结束节点
        if (nodeType.type === 'start' && nodes.some(node => node.type === 'start')) {
          return;
        }
        if (nodeType.type === 'end' && nodes.some(node => node.type === 'end')) {
          return;
        }

        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const newNode = {
          id: `${nodeType.type}-${Date.now()}`,
          type: nodeType.type === 'start' || nodeType.type === 'end' || nodeType.type === 'condition' 
            ? nodeType.type 
            : 'custom',
          position,
          data: {
            label: nodeType.label,
            description: nodeType.description,
            type: nodeType.type,
          },
        };

        setNodes((nds) => nds.concat(newNode));
      } catch (error) {
        console.error('Error dropping node:', error);
      }
    },
    [reactFlowInstance, nodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>工作流组件</div>
        {Object.entries(groupedNodeTypes).map(([category, nodes]) => (
          <div key={category} className={styles.nodeCategory}>
            <div className={styles.categoryTitle}>{category}</div>
            {nodes.map((nodeType) => (
              <div
                key={nodeType.type}
                className={`${styles.nodeTypeItem} ${nodeType.isSpecial ? styles.specialNode : ''}`}
                onDragStart={(event) => onDragStart(event, nodeType)}
                draggable
              >
                <div className={styles.nodeTypeLabel}>{nodeType.label}</div>
                <div className={styles.nodeTypeDescription}>{nodeType.description}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className={styles.designer} ref={reactFlowWrapper}>
        <div className={styles.flowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[20, 20]}
            minZoom={0.1}
            maxZoom={4}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            connectionMode={ConnectionMode.Strict}
            style={{ width: '100%', height: '100%' }}
            defaultEdgeOptions={{
              type: 'smoothstep',
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#999',
              },
              style: {
                strokeWidth: 2,
                stroke: '#999',
              },
            }}
            edgesUpdatable={true}
            edgesFocusable={true}
            connectOnClick={false}
            elevateEdgesOnSelect={true}
          >
            <Background gap={20} color="#aaa" size={1} />
            <Controls showInteractive={false} />
            <MiniMap 
              nodeColor={(node) => {
                switch (node.type) {
                  case 'start':
                    return '#3b82f6';
                  case 'end':
                    return '#ef4444';
                  case 'condition':
                    return '#10b981';
                  default:
                    return '#6b7280';
                }
              }}
            />
            <Panel position="top-right" className={styles.helpPanel}>
              <div className={styles.helpContent}>
                <h4>快捷键说明</h4>
                <ul>
                  <li>空格 + 拖动：平移画布</li>
                  <li>Command/Shift + 点击：多选节点</li>
                  <li>Delete/Backspace：删除选中</li>
                  <li>Command + 滚轮：缩放画布</li>
                </ul>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDesigner; 