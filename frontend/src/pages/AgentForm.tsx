import React from 'react';
import { Form, Input, Row, Col, Select, InputNumber, Button } from 'antd';
import styles from './AgentForm.module.css';

export enum AgentType {
  ASSISTANT = 'assistant',
  FUNCTION = 'function',
  SYSTEM = 'system'
}

interface AgentFormValues {
  name: string;
  description: string;
  type: AgentType;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  tools: string[];
}

interface AgentFormProps {
  initialValues?: Partial<AgentFormValues>;
  onFinish?: (values: AgentFormValues) => void;
  loading?: boolean;
}

const { TextArea } = Input;

const AgentForm: React.FC<AgentFormProps> = ({ initialValues, onFinish, loading = false }) => {
  const [form] = Form.useForm<AgentFormValues>();

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        temperature: 0.7,
        maxTokens: 2000,
        model: 'gpt-4',
        type: AgentType.ASSISTANT,
        ...initialValues
      }}
      className={styles.form}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter the agent name' }]}
          >
            <Input placeholder="Enter agent name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select the agent type' }]}
          >
            <Select>
              <Select.Option value={AgentType.ASSISTANT}>Assistant</Select.Option>
              <Select.Option value={AgentType.FUNCTION}>Function</Select.Option>
              <Select.Option value={AgentType.SYSTEM}>System</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: 'Please enter the agent description' }]}
      >
        <TextArea rows={3} placeholder="Enter agent description" />
      </Form.Item>

      <Form.Item
        name="systemPrompt"
        label="System Prompt"
        rules={[{ required: true, message: 'Please enter the system prompt' }]}
      >
        <TextArea rows={5} placeholder="Enter system prompt" />
      </Form.Item>

      <Form.Item label="Model Parameters">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="model"
              label="Model"
              rules={[{ required: true, message: 'Please select the model' }]}
            >
              <Select>
                <Select.Option value="gpt-4">GPT-4</Select.Option>
                <Select.Option value="gpt-3.5-turbo">GPT-3.5-Turbo</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="temperature"
              label="Temperature"
              rules={[{ required: true, message: 'Please set the temperature' }]}
            >
              <InputNumber min={0} max={1} step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="maxTokens"
              label="Max Tokens"
              rules={[{ required: true, message: 'Please set the max tokens' }]}
            >
              <InputNumber min={1} max={8000} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>

      <Form.Item
        name="tools"
        label="Tools"
      >
        <Select mode="multiple" placeholder="Select tools">
          <Select.Option value="web_search">Web Search</Select.Option>
          <Select.Option value="code_interpreter">Code Interpreter</Select.Option>
          <Select.Option value="file_manager">File Manager</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item className={styles.submitButton}>
        <Button type="primary" htmlType="submit" loading={loading}>
          Save Agent
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AgentForm; 