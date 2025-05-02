import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Select, message, Space } from 'antd';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { createTask, getAgents, getWorkflows } from '@/utils/api';
import { Agent } from '@/types/agent';
import { TaskType } from '@/types/workflow';
import styles from './create.module.css';

const { TextArea } = Input;
const { Option } = Select;

const CreateTaskPage: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);

  useEffect(() => {
    fetchAgents();
    fetchWorkflows();
  }, []);

  const fetchAgents = async () => {
    try {
      const data = await getAgents();
      setAgents(data);
    } catch (error) {
      message.error('获取Agent列表失败');
    }
  };

  const fetchWorkflows = async () => {
    try {
      const data = await getWorkflows();
      setWorkflows(data);
    } catch (error) {
      message.error('获取工作流列表失败');
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      await createTask({
        name: values.name,
        description: values.description,
        type: values.type,
        agent_id: values.agent_id,
        workflow_id: values.workflow_id,
        order: 0,
        config: {}
      });
      message.success('任务创建成功');
      router.push('/tasks');
    } catch (error: any) {
      console.error('创建任务失败:', error);
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          message.error(detail[0].msg || '创建任务失败');
        } else if (typeof detail === 'object') {
          message.error(detail.msg || '创建任务失败');
        } else {
          message.error(detail || '创建任务失败');
        }
      } else {
        message.error('创建任务失败');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="创建任务">
      <div className={styles.createPage}>
        <Card title="创建新任务" className={styles.formCard}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className={styles.form}
          >
            <Form.Item
              label="任务名称"
              name="name"
              rules={[{ required: true, message: '请输入任务名称' }]}
            >
              <Input placeholder="请输入任务名称" />
            </Form.Item>

            <Form.Item
              label="任务描述"
              name="description"
              rules={[{ required: true, message: '请输入任务描述' }]}
            >
              <TextArea
                rows={4}
                placeholder="请输入任务描述"
              />
            </Form.Item>

            <Form.Item
              label="任务类型"
              name="type"
              rules={[{ required: true, message: '请选择任务类型' }]}
            >
              <Select placeholder="请选择任务类型">
                <Option value={TaskType.LLM}>LLM 任务</Option>
                <Option value={TaskType.API}>API 任务</Option>
                <Option value={TaskType.CONDITION}>条件任务</Option>
                <Option value={TaskType.LOOP}>循环任务</Option>
                <Option value={TaskType.PARALLEL}>并行任务</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="所属工作流"
              name="workflow_id"
              rules={[{ required: true, message: '请选择所属工作流' }]}
            >
              <Select placeholder="请选择所属工作流">
                {workflows.map(workflow => (
                  <Option key={workflow.id} value={workflow.id}>
                    {workflow.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="执行Agent"
              name="agent_id"
              rules={[{ required: true, message: '请选择执行Agent' }]}
            >
              <Select placeholder="请选择执行Agent">
                {agents.map(agent => (
                  <Option key={agent.id} value={agent.id}>
                    {agent.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item className={styles.buttons}>
              <Space>
                <Button onClick={() => router.back()}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  创建
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateTaskPage;