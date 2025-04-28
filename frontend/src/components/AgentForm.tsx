import React from 'react';
import { Form, Input, Select, InputNumber, Card, Button, Space, Tooltip, Typography, Row, Col } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { AgentFormData, AGENT_TYPES, MODEL_OPTIONS, TOOL_OPTIONS } from '@/types/agent';
import styles from './AgentForm.module.css';

const { TextArea } = Input;
const { Text } = Typography;

interface AgentFormProps {
  initialValues?: Partial<AgentFormData>;
  onSubmit: (values: AgentFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const AgentForm: React.FC<AgentFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm<AgentFormData>();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        temperature: 0.7,
        maxTokens: 2000,
        tools: [],
        ...initialValues,
      }}
      className={styles.form}
    >
      <Row gutter={24}>
        <Col span={8}>
          <Card title="基本信息" className={styles.card}>
            <Form.Item
              name="name"
              label="Agent名称"
              rules={[{ required: true, message: '请输入Agent名称' }]}
            >
              <Input placeholder="给你的Agent起个名字" />
            </Form.Item>

            <Form.Item
              name="description"
              label="描述"
              rules={[{ required: true, message: '请输入Agent描述' }]}
            >
              <TextArea
                placeholder="描述这个Agent的功能和用途"
                rows={3}
                showCount
                maxLength={200}
              />
            </Form.Item>

            <Form.Item
              name="type"
              label="类型"
              rules={[{ required: true, message: '请选择Agent类型' }]}
            >
              <Select placeholder="选择Agent类型">
                {AGENT_TYPES.map(type => (
                  <Select.Option key={type.value} value={type.value}>
                    <div className={styles.optionContent}>
                      <div className={styles.optionLabel}>{type.label}</div>
                      <div className={styles.optionDescription}>{type.description}</div>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Card>

          <Card title="模型参数" className={styles.card}>
            <Form.Item
              name="model"
              label="语言模型"
              rules={[{ required: true, message: '请选择语言模型' }]}
              extra="选择合适的语言模型来支持Agent的功能"
            >
              <Select placeholder="选择要使用的语言模型">
                {MODEL_OPTIONS.map(model => (
                  <Select.Option key={model.value} value={model.value}>
                    {model.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="temperature"
                  label={
                    <Space>
                      温度
                      <Tooltip title="控制输出的随机性，较高的值会使输出更有创意但可能不太准确">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                  rules={[{ required: true, message: '请设置温度值' }]}
                  extra="建议值：创意任务 0.7-1.0，精确任务 0.1-0.3"
                >
                  <InputNumber
                    min={0}
                    max={2}
                    step={0.1}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="maxTokens"
                  label={
                    <Space>
                      最大Token数
                      <Tooltip title="限制单次响应的最大长度">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                  rules={[{ required: true, message: '请设置最大Token数' }]}
                  extra="建议值：一般任务 2000，长文本任务 4000"
                >
                  <InputNumber
                    min={100}
                    max={4000}
                    step={100}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="工具配置" className={styles.card}>
            <Form.Item
              name="tools"
              label={
                <Space>
                  可用工具
                  <Tooltip title="选择Agent可以使用的工具">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Space>
              }
              extra="为Agent配置所需的工具能力"
            >
              <Select
                mode="multiple"
                placeholder="选择Agent可以使用的工具"
                optionLabelProp="label"
                className={styles.toolSelect}
              >
                {TOOL_OPTIONS.map(tool => (
                  <Select.Option key={tool.value} value={tool.value} label={tool.label}>
                    <div className={styles.optionContent}>
                      <div className={styles.optionLabel}>{tool.label}</div>
                      <div className={styles.optionDescription}>{tool.description}</div>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="系统提示词" className={styles.card}>
            <Form.Item
              name="systemPrompt"
              label={
                <Space>
                  系统提示词
                  <Tooltip title="定义Agent的行为、专业领域和工作方式">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Space>
              }
              rules={[{ required: true, message: '请输入系统提示词' }]}
              extra="系统提示词决定了Agent的角色定位和行为方式"
            >
              <TextArea
                placeholder="输入系统提示词，定义Agent的角色和行为"
                rows={20}
                showCount
                maxLength={2000}
                className={styles.systemPrompt}
              />
            </Form.Item>
          </Card>
        </Col>
      </Row>

      <div className={styles.footer}>
        <Space size="middle">
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            {initialValues ? '更新' : '创建'}
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default AgentForm; 