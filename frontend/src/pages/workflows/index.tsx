import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message } from 'antd';
import { PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import * as api from '@/utils/api';
import { Workflow } from '@/types/workflow';
import styles from './index.module.css';

const WorkflowsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await api.getWorkflows();
      const workflows = response.map(workflow => ({
        ...workflow,
        config: workflow.config || { nodes: [], edges: [] }
      }));
      setWorkflows(workflows);
    } catch (error) {
      message.error('获取工作流列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (router.isReady) {
      fetchWorkflows();
    }
  }, [router.isReady]);

  const columns = [
    {
      title: '工作流名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Workflow) => (
        <a onClick={() => router.push(`/workflows/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      key: 'status',
      render: (_: any, record: Workflow) => {
        const nodes = record.config?.nodes || [];
        const status = nodes.length > 0 ? 'active' : 'inactive';
        const statusMap = {
          active: { color: 'success', text: '已配置' },
          inactive: { color: 'default', text: '未配置' },
          error: { color: 'error', text: '错误' },
        };
        const { color, text } = statusMap[status as keyof typeof statusMap];
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Workflow) => (
        <Space size="middle">
          <a onClick={() => router.push(`/workflows/${record.id}`)}>查看</a>
          <a onClick={() => router.push(`/workflows/${record.id}/edit`)}>编辑</a>
          <a onClick={() => handleDelete(record.id)}>删除</a>
        </Space>
      ),
    },
  ];

  const handleDelete = async (id: string) => {
    try {
      await api.deleteWorkflow(id);
      message.success('删除成功');
      fetchWorkflows();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const extra = (
    <Space>
      <Button
        icon={<SyncOutlined />}
        onClick={fetchWorkflows}
        loading={loading}
      >
        刷新
      </Button>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => router.push('/workflows/create')}
      >
        创建工作流
      </Button>
    </Space>
  );

  return (
    <DashboardLayout
      title="工作流管理"
      subtitle="创建和管理您的业务工作流"
      extra={extra}
    >
      <div className={styles.workflowsTable}>
        <Table
          columns={columns}
          dataSource={workflows}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default WorkflowsPage; 