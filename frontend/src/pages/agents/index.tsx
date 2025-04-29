import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message } from 'antd';
import { PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import * as api from '@/utils/api';
import styles from './index.module.css';

const AgentsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState([]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const data = await api.getAgents();
      setAgents(data);
    } catch (error) {
      message.error('获取Agent列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const columns = [
    {
      title: 'Agent名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <a onClick={() => router.push(`/agents/${record.id}`)}>{text}</a>
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
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'active' ? 'success' : 'default';
        return <Tag color={color}>{status === 'active' ? '运行中' : '已停止'}</Tag>;
      },
    },
    {
      title: '最近执行',
      dataIndex: 'last_execution',
      key: 'last_execution',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: any) => (
        <Space size="middle">
          <a onClick={() => router.push(`/agents/${record.id}`)}>查看</a>
          <a onClick={() => router.push(`/agents/${record.id}/edit`)}>编辑</a>
          <a onClick={() => handleDelete(record.id)}>删除</a>
        </Space>
      ),
    },
  ];

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAgent(id);
      message.success('删除成功');
      fetchAgents();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const extra = (
    <Space>
      <Button
        icon={<SyncOutlined />}
        onClick={fetchAgents}
        loading={loading}
      >
        刷新
      </Button>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => router.push('/agents/create')}
      >
        创建Agent
      </Button>
    </Space>
  );

  return (
    <DashboardLayout
      title="Agent管理"
      subtitle="创建和管理您的智能Agent"
      extra={extra}
    >
      <div className={styles.agentsTable}>
        <Table
          columns={columns}
          dataSource={agents}
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

export default AgentsPage; 