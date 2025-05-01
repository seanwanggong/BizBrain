import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, message } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { getExecutions, stopExecution } from '@/utils/api';
import styles from './index.module.css';

interface Execution {
  id: string;
  workflow: string;
  status: 'success' | 'running' | 'failed' | 'pending';
  started_at: string;
  finished_at: string;
}

const ExecutionsPage: React.FC = () => {
  const router = useRouter();
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const data = await getExecutions();
      setExecutions(data);
    } catch (error) {
      message.error('获取执行记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, []);

  const handleStop = async (id: string) => {
    try {
      await stopExecution(id);
      message.success('已发送停止请求');
      fetchExecutions();
    } catch (error) {
      message.error('停止执行失败');
    }
  };

  const columns = [
    {
      title: '执行ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: string, record: Execution) => (
        <a onClick={() => router.push(`/executions/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '工作流',
      dataIndex: 'workflow',
      key: 'workflow',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: Execution['status']) => {
        const statusMap = {
          success: { color: 'success', text: '成功' },
          running: { color: 'processing', text: '运行中' },
          failed: { color: 'error', text: '失败' },
          pending: { color: 'default', text: '等待中' }
        };
        const { color, text } = statusMap[status];
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '开始时间',
      dataIndex: 'started_at',
      key: 'started_at',
    },
    {
      title: '结束时间',
      dataIndex: 'finished_at',
      key: 'finished_at',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Execution) => (
        <Space size="middle">
          <a onClick={() => router.push(`/executions/${record.id}`)}>查看详情</a>
          {record.status === 'running' && (
            <a onClick={() => handleStop(record.id)}>停止</a>
          )}
        </Space>
      ),
    },
  ];

  const extra = (
    <Button
      icon={<SyncOutlined />}
      onClick={fetchExecutions}
      loading={loading}
    >
      刷新
    </Button>
  );

  return (
    <DashboardLayout
      title="执行记录"
      subtitle="查看所有执行记录"
      extra={extra}
    >
      <div className={styles.executionsTable}>
        <Table
          columns={columns}
          dataSource={executions}
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

export default ExecutionsPage; 