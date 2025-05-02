import { ReactFlow, Node, Edge, Background, Controls, MiniMap, Panel, ConnectionMode, MarkerType, NodeTypes, OnEdgeUpdateFunc, EdgeChange, Connection, useNodesState, useEdgesState, ReactFlowInstance, addEdge, applyEdgeChanges, useReactFlow, applyNodeChanges, NodeChange } from 'reactflow';
import { Modal } from 'antd';
import React, { useCallback, useRef, useState, useEffect, useMemo, memo } from 'react';
import CustomNode from './nodes/CustomNode';
import StartNode from './nodes/StartNode';
import EndNode from './nodes/EndNode';
import ConditionNode from './nodes/ConditionNode';
import FormDesigner from './FormDesigner';
import styles from '@/styles/WorkflowDesigner.module.css';
import 'reactflow/dist/style.css';
import { message } from 'antd';

// 创建一个记忆化的自定义节点包装组件
const CustomNodeWrapper = memo(({ id, data, ...props }: any) => {
  return (
    <div>
      <CustomNode {...props} id={id} data={data} />
    </div>
  );
});

CustomNodeWrapper.displayName = 'CustomNodeWrapper';

// 在组件外部定义节点类型
const NODE_TYPES: NodeTypes = {
  start: StartNode,
  end: EndNode,
  condition: ConditionNode,
  custom: CustomNodeWrapper,
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
  
  // Agent 节点
  {
    type: 'agent_task',
    label: 'Agent 任务',
    description: '执行特定的 Agent 任务',
    category: 'Agent'
  },
  {
    type: 'agent_conversation',
    label: 'Agent 对话',
    description: '与 Agent 进行对话交互',
    category: 'Agent'
  },
  {
    type: 'agent_chain',
    label: 'Agent 链',
    description: '多个 Agent 协同工作的任务链',
    category: 'Agent'
  },
  {
    type: 'agent_tool',
    label: 'Agent 工具',
    description: '调用 Agent 的特定工具能力',
    category: 'Agent'
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

interface BackendNode {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

interface BackendEdge {
  source: string;
  target: string;
  type?: string;
}

interface WorkflowDesignerProps {
  onChange?: (data: { nodes: Node[]; edges: Edge[] }) => void;
  initialNodes?: BackendNode[];
  initialEdges?: BackendEdge[];
  readOnly?: boolean;
}

const convertToReactFlowNode = (node: BackendNode): Node => ({
  id: node.id,
  type: node.type === 'start' || node.type === 'end' ? node.type : 'custom',
  position: node.position,
  data: {
    type: node.type,
    label: node.name,
    config: node.config || {},
  },
});

const convertToReactFlowEdge = (edge: BackendEdge): Edge => ({
  id: `${edge.source}-${edge.target}`,
  source: edge.source,
  target: edge.target,
  type: edge.type || 'default',
});

const WorkflowDesigner: React.FC<WorkflowDesignerProps> = ({ 
  onChange,
  initialNodes: propInitialNodes = [],
  initialEdges: propInitialEdges = [],
  readOnly = false,
}) => {
  const [nodes, setNodes] = useNodesState(
    propInitialNodes.length > 0 
      ? propInitialNodes.map(convertToReactFlowNode)
      : initialNodes
  );
  const [edges, setEdges] = useEdgesState(
    propInitialEdges.length > 0
      ? propInitialEdges.map(convertToReactFlowEdge)
      : []
  );
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isFormDesignerOpen, setIsFormDesignerOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const handleNodeDoubleClick = useCallback((nodeId: string, nodeData: any) => {
    console.log('Double click handler called with nodeId:', nodeId, 'nodeData:', nodeData);
    if (nodeData && nodeData.type === 'form') {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        console.log('Opening form designer for node:', node);
        setSelectedNode(node);
        setIsFormDesignerOpen(true);
      }
    }
  }, [nodes]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, [setNodes]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, [setEdges]);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDragStart = useCallback((event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const data = event.dataTransfer.getData('application/reactflow');
      
      if (!reactFlowBounds || !reactFlowInstance) {
        message.error('无法获取设计器边界');
        return;
      }

      try {
        const nodeType = JSON.parse(data) as NodeType;

        // 检查是否已经存在开始或结束节点
        if (nodeType.type === 'start' && nodes.some(node => node.type === 'start')) {
          message.warning('已存在开始节点');
          return;
        }
        if (nodeType.type === 'end' && nodes.some(node => node.type === 'end')) {
          message.warning('已存在结束节点');
          return;
        }

        // 计算放置位置
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const nodeId = `${nodeType.type}-${Date.now()}`;
        console.log('Creating new node with id:', nodeId);

        // 添加新节点
        const newNode = {
          id: nodeId,
          type: nodeType.type === 'start' || nodeType.type === 'end' || nodeType.type === 'condition' 
            ? nodeType.type 
            : 'custom',
          position,
          data: {
            label: nodeType.label || '新节点',
            description: nodeType.description || '',
            type: nodeType.type,
            onDoubleClick: handleNodeDoubleClick,
            config: nodeType.type === 'form' ? { formSchema: { fields: [] } } : {},
          },
        };

        console.log('Adding new node:', newNode);
        setNodes((nds) => {
          const updatedNodes = nds.concat(newNode);
          console.log('Updated nodes:', updatedNodes);
          return updatedNodes;
        });
      } catch (error) {
        console.error('Error dropping node:', error);
        message.error('添加节点失败');
      }
    },
    [reactFlowInstance, nodes, handleNodeDoubleClick, setNodes]
  );

  const onEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      setEdges((els) => {
        const updatedEdges = els.map((e) => {
          if (e.id === oldEdge.id) {
            return {
              ...e,
              source: newConnection.source || e.source,
              target: newConnection.target || e.target,
              sourceHandle: newConnection.sourceHandle || e.sourceHandle,
              targetHandle: newConnection.targetHandle || e.targetHandle,
            };
          }
          return e;
        });
        return updatedEdges;
      });
    },
    [setEdges]
  );

  const handleFormDesignerSubmit = useCallback((formSchema: any) => {
    if (selectedNode) {
      setNodes((nds) => 
        nds.map(node => 
          node.id === selectedNode.id 
            ? { 
                ...node, 
                data: { 
                  ...node.data, 
                  config: {
                    ...node.data.config,
                    formSchema
                  }
                } 
              }
            : node
        )
      );
      setIsFormDesignerOpen(false);
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes]);

  useEffect(() => {
    if (onChange) {
      onChange({ nodes, edges });
    }
  }, [nodes, edges, onChange]);

  return (
    <div className={styles.container}>
      {!readOnly && (
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
      )}
      <div className={`${styles.designer} ${readOnly ? styles.fullWidth : ''}`} ref={reactFlowWrapper}>
        <div className={styles.flowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={readOnly ? undefined : onNodesChange}
            onEdgesChange={readOnly ? undefined : onEdgesChange}
            onConnect={readOnly ? undefined : onConnect}
            onEdgeUpdate={readOnly ? undefined : onEdgeUpdate}
            onInit={setReactFlowInstance}
            onDrop={readOnly ? undefined : onDrop}
            onDragOver={readOnly ? undefined : onDragOver}
            nodeTypes={NODE_TYPES}
            nodesDraggable={!readOnly}
            nodesConnectable={!readOnly}
            elementsSelectable={!readOnly}
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
            {!readOnly && (
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
            )}
          </ReactFlow>
        </div>
      </div>

      <Modal
        title="表单设计器"
        open={isFormDesignerOpen}
        onCancel={() => {
          setIsFormDesignerOpen(false);
          setSelectedNode(null);
        }}
        footer={null}
        width={800}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
        destroyOnClose
        maskClosable={false}
      >
        <FormDesigner
          initialValue={selectedNode?.data?.config?.formSchema}
          onChange={handleFormDesignerSubmit}
        />
      </Modal>
    </div>
  );
};

export default WorkflowDesigner; 