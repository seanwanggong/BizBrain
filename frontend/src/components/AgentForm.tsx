import React from 'react';
import { Form, Input, Select, Switch, Button, Space } from 'antd';
import { AgentCreate, AgentUpdate } from '@/types/agent';

const { TextArea } = Input;
const { Option } = Select;

interface AgentFormProps {
  initialValues?: AgentCreate | AgentUpdate;
  onSubmit: (values: AgentCreate | AgentUpdate) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const AgentForm: React.FC<AgentFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isEdit = false,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleSubmit}
    >
      <Form.Item
        name="name"
        label="Name"
        rules={[{ required: true, message: 'Please input the agent name!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: 'Please input the agent description!' }]}
      >
        <TextArea rows={4} />
      </Form.Item>

      <Form.Item
        name="type"
        label="Type"
        rules={[{ required: true, message: 'Please select the agent type!' }]}
      >
        <Select>
          <Option value="general">General</Option>
          <Option value="data_analysis">Data Analysis</Option>
          <Option value="web_scraping">Web Scraping</Option>
          <Option value="file_processing">File Processing</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="config"
        label="Configuration"
        rules={[{ required: true, message: 'Please input the agent configuration!' }]}
      >
        <TextArea rows={6} />
      </Form.Item>

      <Form.Item
        name="is_active"
        label="Active"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            {isEdit ? 'Update' : 'Create'}
          </Button>
          <Button onClick={onCancel}>
            Cancel
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default AgentForm; 