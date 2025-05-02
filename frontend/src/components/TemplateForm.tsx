import React from 'react';
import { Form, Input, Select, Button, Row, Col, Space } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { TemplateFormData } from '@/types/agent';
import styles from './AgentForm.module.css';

const { TextArea } = Input;

interface TemplateFormProps {
  form: any;
  isGenerating: boolean;
  onGenerate: () => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({
  form,
  isGenerating,
  onGenerate,
}) => {
  return (
    <div className={styles.templateSection}>
      <div className={styles.templateHeader}>
        <span>提示词模板</span>
        <span className={styles.templateExtra}>填写以下信息，快速生成系统提示词</span>
      </div>
      
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="industry"
              label="行业"
              rules={[{ required: true, message: '请输入行业' }]}
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
              rules={[{ required: true, message: '请输入角色' }]}
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
              rules={[{ required: true, message: '请选择语气' }]}
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
          rules={[{ required: true, message: '请输入目标' }]}
        >
          <Input placeholder="例如：提供专业建议、分析数据、解决问题等" />
        </Form.Item>

        <Form.Item
          name="responsibilities"
          label="职责"
          rules={[{ required: true, message: '请输入职责' }]}
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
              rules={[{ required: true, message: '请输入重点' }]}
            >
              <Input placeholder="例如：准确性、效率、用户体验等" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="principles"
              label="原则"
              rules={[{ required: true, message: '请输入原则' }]}
            >
              <Input placeholder="例如：客观公正、数据驱动、用户至上等" />
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
            icon={<ThunderboltOutlined />}
            onClick={onGenerate}
            loading={isGenerating}
            block
          >
            生成系统提示词
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default TemplateForm; 