import React, { useState } from 'react';
import { Steps, Card, message } from 'antd';
import FormExecutor from './FormExecutor';

interface WorkflowExecutorProps {
  workflow: {
    id: string;
    name: string;
    nodes: Array<{
      id: string;
      type: string;
      name: string;
      config?: any;
    }>;
  };
  onComplete: (result: any) => void;
  onCancel: () => void;
}

const WorkflowExecutor: React.FC<WorkflowExecutorProps> = ({
  workflow,
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [executionData, setExecutionData] = useState<Record<string, any>>({});

  const handleStepComplete = async (nodeId: string, data: any) => {
    const newExecutionData = {
      ...executionData,
      [nodeId]: data,
    };
    setExecutionData(newExecutionData);

    if (currentStep < workflow.nodes.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        // 工作流执行完成，调用回调
        onComplete(newExecutionData);
        message.success('工作流执行完成');
      } catch (error) {
        console.error('工作流执行失败:', error);
        message.error('工作流执行失败');
      }
    }
  };

  const renderStepContent = () => {
    const currentNode = workflow.nodes[currentStep];
    
    switch (currentNode.type) {
      case 'form':
        return (
          <FormExecutor
            formConfig={currentNode.config}
            onSubmit={(values) => handleStepComplete(currentNode.id, values)}
            onCancel={onCancel}
          />
        );
      // 其他节点类型的处理...
      default:
        return null;
    }
  };

  return (
    <Card>
      <Steps
        current={currentStep}
        items={workflow.nodes.map((node) => ({
          title: node.name,
          description: node.type,
        }))}
        style={{ marginBottom: 24 }}
      />
      {renderStepContent()}
    </Card>
  );
};

export default WorkflowExecutor; 