import React from 'react';
import { Form, Input, Select, Button, Space, Card } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

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

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues || {
        nodes: [{ type: 'start', name: '开始' }],
      }}
      onFinish={onSubmit}
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
              {fields.map((field, index) => (
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
                    <Select placeholder="请选择节点类型">
                      <Option value="start">开始节点</Option>
                      <Option value="agent">Agent 节点</Option>
                      <Option value="condition">条件节点</Option>
                      <Option value="action">动作节点</Option>
                      <Option value="end">结束节点</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    {...field}
                    name={[field.name, 'config']}
                    label="节点配置"
                  >
                    <TextArea rows={4} placeholder="请输入节点配置（JSON格式）" />
                  </Form.Item>
                </Card>
              ))}
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
  );
};

export default WorkflowForm; 