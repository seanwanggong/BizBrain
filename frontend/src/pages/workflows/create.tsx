import React from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import styles from '@/styles/Workflows.module.css';

const { TextArea } = Input;

interface WorkflowFormData {
  name: string;
  description: string;
}

const CreateWorkflowPage: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm();

  const onFinish = (values: WorkflowFormData) => {
    try {
      // 将基本信息作为查询参数传递给设计页面
      router.push({
        pathname: '/workflows/new',
        query: {
          name: values.name,
          description: values.description,
        },
      });
    } catch (error) {
      message.error('创建失败');
    }
  };

  return (
    <DashboardLayout title="创建工作流">
      <div className={styles.createPage}>
        <Card title="创建新工作流" className={styles.formCard}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className={styles.form}
          >
            <Form.Item
              label="工作流名称"
              name="name"
              rules={[{ required: true, message: '请输入工作流名称' }]}
            >
              <Input placeholder="请输入工作流名称" />
            </Form.Item>

            <Form.Item
              label="工作流描述"
              name="description"
              rules={[{ required: true, message: '请输入工作流描述' }]}
            >
              <TextArea
                rows={4}
                placeholder="请输入工作流描述"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                下一步
              </Button>
              <Button 
                style={{ marginLeft: 8 }} 
                onClick={() => router.push('/workflows')}
              >
                取消
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateWorkflowPage; 