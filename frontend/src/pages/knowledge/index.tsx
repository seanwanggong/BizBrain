import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Row, Col, Statistic, message } from 'antd';
import { PlusOutlined, SyncOutlined, BookOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import * as api from '@/utils/api';
import styles from './index.module.css';

interface KnowledgeBase {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  documents_count: number;
  created_at: string;
  updated_at: string;
}

const KnowledgePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);

  const fetchKnowledgeBases = async () => {
    try {
      setLoading(true);
      const data = await api.getKnowledgeBases();
      setKnowledgeBases(data);
    } catch (error) {
      message.error('获取知识库列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeBases();
  }, []);

  const columns = [
    {
      title: '知识库名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: KnowledgeBase) => (
        <a onClick={() => router.push(`/knowledge/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          active: { color: 'success', text: '已发布' },
          draft: { color: 'default', text: '草稿' },
          archived: { color: 'warning', text: '已归档' },
        };
        const { color, text } = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '文档数',
      dataIndex: 'documents_count',
      key: 'documents_count',
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: KnowledgeBase) => (
        <Space size="middle">
          <a onClick={() => router.push(`/knowledge/${record.id}`)}>查看</a>
          <a onClick={() => router.push(`/knowledge/${record.id}/edit`)}>编辑</a>
          <a onClick={() => handleDelete(record.id)}>删除</a>
        </Space>
      ),
    },
  ];

  const handleDelete = async (id: string) => {
    try {
      await api.deleteKnowledgeBase(id);
      message.success('删除成功');
      fetchKnowledgeBases();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const extra = (
    <Space>
      <Button
        icon={<SyncOutlined />}
        onClick={fetchKnowledgeBases}
        loading={loading}
      >
        刷新
      </Button>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => router.push('/knowledge/create')}
      >
        创建知识库
      </Button>
    </Space>
  );

  return (
    <DashboardLayout
      title="知识库管理"
      subtitle="创建和管理您的业务知识库"
      extra={extra}
    >
      <div>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8}>
            <div className={styles.statsCard}>
              <Statistic
                title="知识库总数"
                value={knowledgeBases.length}
                prefix={<BookOutlined />}
              />
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className={styles.statsCard}>
              <Statistic
                title="文档总数"
                value={knowledgeBases.reduce((sum, kb) => sum + kb.documents_count, 0)}
                prefix={<FileTextOutlined />}
              />
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className={styles.statsCard}>
              <Statistic
                title="活跃知识库"
                value={knowledgeBases.filter(kb => kb.status === 'active').length}
                prefix={<TeamOutlined />}
              />
            </div>
          </Col>
        </Row>

        <div className={styles.knowledgeTable}>
          <Table
            columns={columns}
            dataSource={knowledgeBases}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default KnowledgePage; 