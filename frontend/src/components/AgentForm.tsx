import React, {useState} from 'react';
import {Form, Input, Select, InputNumber, Card, Button, Space, Tooltip, Typography, Row, Col, Divider, message} from 'antd';
import {QuestionCircleOutlined, ThunderboltOutlined} from '@ant-design/icons';
import {AgentFormData, TemplateFormData, AGENT_TYPES, MODEL_OPTIONS, TOOL_OPTIONS} from '@/types/agent';
import styles from './AgentForm.module.css';

const {TextArea} = Input;
const {Text} = Typography;

interface ValidationError {
    response?: {
        data?: {
            detail: Array<{
                msg: string;
                loc: string[];
                type: string;
                input?: any;
                url?: string;
            }> | {
                msg: string;
                loc: string[];
                type: string;
                input?: any;
                url?: string;
            };
        };
    };
    errorFields?: Array<{ errors: string[] }>;
}

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
    const [templateForm] = Form.useForm<TemplateFormData>();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSubmit(values);
        } catch (error: unknown) {
            console.error('Form submission error:', error);
            const validationError = error as ValidationError;
            
            if (validationError.response?.data?.detail) {
                const detail = validationError.response.data.detail;
                if (Array.isArray(detail)) {
                    // Handle array of validation errors
                    const firstError = detail[0];
                    const errorMessage = typeof firstError === 'object' ? firstError.msg : String(firstError);
                    message.error(errorMessage);
                } else if (typeof detail === 'object') {
                    // Handle single validation error object
                    const errorMessage = detail.msg || JSON.stringify(detail);
                    message.error(errorMessage);
                } else {
                    // Handle string or other types
                    message.error(String(detail));
                }
            } else if (validationError.errorFields) {
                const firstError = validationError.errorFields[0];
                message.error(firstError.errors[0]);
            } else {
                message.error('An error occurred while submitting the form');
            }
        }
    };

    const generateSystemPrompt = async () => {
        try {
            setIsGenerating(true);
            const values = await templateForm.validateFields();

            // 空值保护与类型断言
            const industry = values.industry as string || '';
            const role = values.role as string || '';
            const goal = values.goal as string || '';
            const responsibilities = values.responsibilities as string || '';
            const tone = values.tone as string || '';
            const focus = values.focus as string || '';
            const principles = values.principles as string || '';
            const additionalInfo = values.additionalInfo as string || '';

            const generatedPrompt = `你是一个${industry}领域的${role}，专注于${goal}。
            你的主要职责包括：
            ${responsibilities.split('\n').map((r: string) => `- ${r}`).join('\n')}
            
            你的工作方式：
            - 保持${tone}的语气
            - 注重${focus}
            - 遵循${principles}
            
            ${additionalInfo ? `其他要求：\n${additionalInfo}` : ''}`;

            form.setFieldsValue({
                ...form.getFieldsValue(),
                config: {
                    ...form.getFieldsValue().config,
                    systemPrompt: generatedPrompt
                } as Partial<AgentFormData['config']>
            } as Partial<AgentFormData>);
        } catch (error) {
            console.error('Template form validation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };


    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{
                config: {
                    temperature: 0.7,
                    maxTokens: 2000,
                    tools: [],
                    ...initialValues?.config,
                },
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
                            rules={[{required: true, message: '请输入Agent名称'}]}
                        >
                            <Input placeholder="给你的Agent起个名字"/>
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="描述"
                            rules={[{required: true, message: '请输入Agent描述'}]}
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
                            rules={[{required: true, message: '请选择Agent类型'}]}
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

                        <Divider/>

                        <Form.Item
                            name={['config', 'model']}
                            label="语言模型"
                            rules={[{required: true, message: '请选择语言模型'}]}
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
                                    name={['config', 'temperature']}
                                    label={
                                        <Space>
                                            温度
                                            <Tooltip title="控制输出的随机性，较高的值会使输出更有创意但可能不太准确">
                                                <QuestionCircleOutlined/>
                                            </Tooltip>
                                        </Space>
                                    }
                                    rules={[{required: true, message: '请设置温度值'}]}
                                    extra="建议值：创意任务 0.7-1.0，精确任务 0.1-0.3"
                                >
                                    <InputNumber
                                        min={0}
                                        max={2}
                                        step={0.1}
                                        style={{width: '100%'}}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name={['config', 'maxTokens']}
                                    label={
                                        <Space>
                                            最大Token数
                                            <Tooltip title="限制单次响应的最大长度">
                                                <QuestionCircleOutlined/>
                                            </Tooltip>
                                        </Space>
                                    }
                                    rules={[{required: true, message: '请设置最大Token数'}]}
                                    extra="建议值：一般任务 2000，长文本任务 4000"
                                >
                                    <InputNumber
                                        min={100}
                                        max={4000}
                                        step={100}
                                        style={{width: '100%'}}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name={['config', 'tools']}
                            label={
                                <Space>
                                    可用工具
                                    <Tooltip title="选择Agent可以使用的工具">
                                        <QuestionCircleOutlined/>
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

                <Col span={16}>
                    <Card title="系统提示词" className={styles.card}>
                        <div className={styles.templateSection}>
                            <div className={styles.templateHeader}>
                                <span>提示词模板</span>
                                <span className={styles.templateExtra}>填写以下信息，快速生成系统提示词</span>
                            </div>
                            <Form form={templateForm} layout="vertical">
                                <div className={styles.templateForm}>
                                    <Row gutter={16}>
                                        <Col span={8}>
                                            <Form.Item
                                                name="industry"
                                                label="行业"
                                                rules={[{required: true, message: '请输入行业'}]}
                                            >
                                                <Select placeholder="选择行业">
                                                    <Select.Option value="科技">科技</Select.Option>
                                                    <Select.Option value="金融">金融</Select.Option>
                                                    <Select.Option value="教育">教育</Select.Option>
                                                    <Select.Option value="医疗">医疗</Select.Option>
                                                    <Select.Option value="零售">零售</Select.Option>
                                                    <Select.Option value="其他">其他</Select.Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>

                                        <Col span={8}>
                                            <Form.Item
                                                name="role"
                                                label="角色"
                                                rules={[{required: true, message: '请输入角色'}]}
                                            >
                                                <Select placeholder="选择角色">
                                                    <Select.Option value="专家">专家</Select.Option>
                                                    <Select.Option value="顾问">顾问</Select.Option>
                                                    <Select.Option value="助手">助手</Select.Option>
                                                    <Select.Option value="分析师">分析师</Select.Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>

                                        <Col span={8}>
                                            <Form.Item
                                                name="tone"
                                                label="语气"
                                                rules={[{required: true, message: '请选择语气'}]}
                                            >
                                                <Select placeholder="选择语气">
                                                    <Select.Option value="专业">专业</Select.Option>
                                                    <Select.Option value="友好">友好</Select.Option>
                                                    <Select.Option value="严谨">严谨</Select.Option>
                                                    <Select.Option value="简洁">简洁</Select.Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item
                                        name="goal"
                                        label="目标"
                                        rules={[{required: true, message: '请输入目标'}]}
                                    >
                                        <Input placeholder="例如：提供专业建议、分析数据、解决问题等"/>
                                    </Form.Item>

                                    <Form.Item
                                        name="responsibilities"
                                        label="职责"
                                        rules={[{required: true, message: '请输入职责'}]}
                                    >
                                        <TextArea
                                            placeholder="每行输入一个职责，例如：\n分析市场趋势\n提供投资建议\n评估风险"
                                            rows={3}
                                        />
                                    </Form.Item>

                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item
                                                name="focus"
                                                label="重点"
                                                rules={[{required: true, message: '请输入重点'}]}
                                            >
                                                <Input placeholder="例如：准确性、效率、用户体验等"/>
                                            </Form.Item>
                                        </Col>

                                        <Col span={12}>
                                            <Form.Item
                                                name="principles"
                                                label="原则"
                                                rules={[{required: true, message: '请输入原则'}]}
                                            >
                                                <Input placeholder="例如：客观公正、数据驱动、用户至上等"/>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item
                                        name="additionalInfo"
                                        label="其他要求"
                                    >
                                        <TextArea
                                            placeholder="输入其他特殊要求或限制"
                                            rows={2}
                                        />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            icon={<ThunderboltOutlined/>}
                                            onClick={generateSystemPrompt}
                                            loading={isGenerating}
                                            block
                                        >
                                            生成系统提示词
                                        </Button>
                                    </Form.Item>
                                </div>
                            </Form>
                        </div>

                        <Divider/>

                        <Form.Item
                            name={['config', 'systemPrompt']}
                            label={
                                <Space>
                                    系统提示词
                                    <Tooltip title="定义Agent的行为、专业领域和工作方式">
                                        <QuestionCircleOutlined/>
                                    </Tooltip>
                                </Space>
                            }
                            rules={[{required: true, message: '请输入系统提示词'}]}
                            extra="系统提示词决定了Agent的角色定位和行为方式"
                        >
                            <TextArea
                                placeholder="输入系统提示词，定义Agent的角色和行为"
                                rows={15}
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