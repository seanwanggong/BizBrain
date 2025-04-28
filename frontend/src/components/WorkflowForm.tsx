import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Space, Card, Modal, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import FormDesigner from '@/components/FormDesigner';

const { TextArea } = Input;
const { Option } = Select;

interface WorkflowFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const WorkflowForm: React.FC<WorkflowFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isEdit = false,
}) => {
  const [form] = Form.useForm();
  const [formDesignerVisible, setFormDesignerVisible] = useState(false);
  const [currentNodeIndex, setCurrentNodeIndex] = useState<number | null>(null);
  const [currentFormSchema, setCurrentFormSchema] = useState<any>(null);

  // 监听节点类型变化
  const handleNodeTypeChange = (index: number, value: string) => {
    const nodes = form.getFieldValue('nodes');
    if (value === 'form') {
      nodes[index].config = {
        title: '',
        description: '',
        formSchema: {
          fields: []
        }
      };
    } else {
      nodes[index].config = {};
    }
    form.setFieldsValue({ nodes });
  };

  const showFormDesigner = (index: number) => {
    const nodes = form.getFieldValue('nodes');
    const currentNode = nodes[index];
    setCurrentNodeIndex(index);
    setCurrentFormSchema(currentNode.config?.formSchema || { fields: [] });
    setFormDesignerVisible(true);
  };

  const handleFormDesignerSubmit = (schema: any) => {
    if (currentNodeIndex !== null) {
      const nodes = form.getFieldValue('nodes');
      nodes[currentNodeIndex].config = {
        ...nodes[currentNodeIndex].config,
        formSchema: schema
      };
      form.setFieldsValue({ nodes });
      message.success('表单设计已保存');
    }
    setFormDesignerVisible(false);
  };

  const handleSubmit = async (values: any) => {
    // 验证表单节点的配置
    const hasInvalidFormNode = values.nodes.some((node: any, index: number) => {
      if (node.type === 'form') {
        if (!node.config?.formSchema?.fields?.length) {
          message.error(`节点 ${index + 1} 的表单字段未配置`);
          return true;
        }
      }
      return false;
    });

    if (hasInvalidFormNode) {
      return;
    }

    onSubmit(values);
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues || {
          nodes: [{ type: 'start', name: '开始' }],
        }}
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="工作流名称"
          rules={[{ required: true, message: '请输入工作流名称' }]}
        >
          <Input placeholder="请输入工作流名称" />
        </Form.Item>

        <Form.Item
          name="description"
          label="描述"
          rules={[{ required: true, message: '请输入工作流描述' }]}
        >
          <TextArea rows={4} placeholder="请输入工作流描述" />
        </Form.Item>

        <Card title="节点配置" style={{ marginBottom: 24 }}>
          <Form.List name="nodes">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => {
                  const nodeType = form.getFieldValue(['nodes', index, 'type']);
                  const nodeConfig = form.getFieldValue(['nodes', index, 'config']);
                  return (
                    <Card
                      key={field.key}
                      style={{ marginBottom: 16 }}
                      title={`节点 ${index + 1}`}
                      extra={
                        index !== 0 && (
                          <MinusCircleOutlined onClick={() => remove(field.name)} />
                        )
                      }
                    >
                      <Form.Item
                        {...field}
                        name={[field.name, 'name']}
                        label="节点名称"
                        rules={[{ required: true, message: '请输入节点名称' }]}
                      >
                        <Input placeholder="请输入节点名称" />
                      </Form.Item>

                      <Form.Item
                        {...field}
                        name={[field.name, 'type']}
                        label="节点类型"
                        rules={[{ required: true, message: '请选择节点类型' }]}
                      >
                        <Select 
                          placeholder="请选择节点类型"
                          onChange={(value) => handleNodeTypeChange(index, value)}
                        >
                          <Option value="start">开始节点</Option>
                          <Option value="agent">Agent 节点</Option>
                          <Option value="condition">条件节点</Option>
                          <Option value="form">表单收集节点</Option>
                          <Option value="action">动作节点</Option>
                          <Option value="end">结束节点</Option>
                        </Select>
                      </Form.Item>

                      {nodeType === 'form' && (
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'config', 'title']}
                            label="表单标题"
                            rules={[{ required: true, message: '请输入表单标题' }]}
                          >
                            <Input placeholder="请输入表单标题" />
                          </Form.Item>
                          <Form.Item
                            {...field}
                            name={[field.name, 'config', 'description']}
                            label="表单描述"
                          >
                            <TextArea rows={2} placeholder="请输入表单描述" />
                          </Form.Item>
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <Button 
                              type="dashed" 
                              onClick={() => showFormDesigner(index)}
                              block
                            >
                              设计表单字段
                            </Button>
                            {nodeConfig?.formSchema?.fields?.length > 0 && (
                              <div style={{ color: '#52c41a' }}>
                                已配置 {nodeConfig.formSchema.fields.length} 个字段
                              </div>
                            )}
                          </Space>
                        </Space>
                      )}

                      {nodeType !== 'form' && (
                        <Form.Item
                          {...field}
                          name={[field.name, 'config']}
                          label="节点配置"
                        >
                          <TextArea rows={4} placeholder="请输入节点配置（JSON格式）" />
                        </Form.Item>
                      )}
                    </Card>
                  );
                })}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  添加节点
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              {isEdit ? '更新' : '创建'}
            </Button>
            <Button onClick={onCancel}>取消</Button>
          </Space>
        </Form.Item>
      </Form>

      <Modal
        title="表单设计器"
        open={formDesignerVisible}
        onCancel={() => setFormDesignerVisible(false)}
        width="80%"
        footer={null}
        destroyOnClose
      >
        <FormDesigner 
          onChange={handleFormDesignerSubmit}
          initialValue={currentFormSchema}
        />
      </Modal>
    </>
  );
};

export default WorkflowForm; 