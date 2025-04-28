import React, { useState } from 'react';
import { Card, Button, Space, Table, Tag, Typography, Modal, message, Input, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileOutlined, UploadOutlined, SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import KnowledgeBaseForm from '@/components/KnowledgeBaseForm';
import { KnowledgeBase } from '@/types/knowledge';
import styles from './index.module.css';
import DashboardLayout from '@/components/layouts/DashboardLayout';

const { Title } = Typography;
const { Search } = Input;

const KnowledgePage = () => {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([
    {
      id: '1',
      name: '产品文档',
      description: '包含所有产品相关的文档和说明',
      createdAt: '2024-03-20',
      updatedAt: '2024-03-20',
      documents: [],
    },
    {
      id: '2',
      name: '技术文档',
      description: '技术架构和开发文档',
      createdAt: '2024-03-19',
      updatedAt: '2024-03-19',
      documents: [],
    },
  ]);
  const [searchText, setSearchText] = useState('');

  const handleCreate = () => {
    setSelectedKnowledgeBase(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: KnowledgeBase) => {
    setSelectedKnowledgeBase(record);
    setIsModalVisible(true);
  };

  const handleDelete = (record: KnowledgeBase) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除知识库 "${record.name}" 吗？`,
      onOk: () => {
        setKnowledgeBases(knowledgeBases.filter(kb => kb.id !== record.id));
        message.success('知识库已删除');
      },
    });
  };

  const handleSubmit = (values: any) => {
    if (selectedKnowledgeBase) {
      // 更新现有知识库
      setKnowledgeBases(knowledgeBases.map(kb => 
        kb.id === selectedKnowledgeBase.id 
          ? { ...kb, ...values, updatedAt: new Date().toISOString() }
          : kb
      ));
      message.success('知识库已更新');
    } else {
      // 创建新知识库
      const newKnowledgeBase: KnowledgeBase = {
        id: Date.now().toString(),
        ...values,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        documents: [],
      };
      setKnowledgeBases([...knowledgeBases, newKnowledgeBase]);
      message.success('知识库已创建');
    }
    setIsModalVisible(false);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    // 实现搜索逻辑
  };

  const handleUpload = (info: any) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 上传成功`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`);
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: KnowledgeBase) => (
        <a onClick={() => router.push(`/knowledge/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '文档数量',
      key: 'documents',
      render: (record: KnowledgeBase) => (
        <Tag color="blue">{record.documents.length}</Tag>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (record: KnowledgeBase) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <Title level={2}>知识库管理</Title>
          <Space size="large">
            <Search
              placeholder="搜索知识库"
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              创建知识库
            </Button>
          </Space>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={knowledgeBases}
            rowKey="id"
            pagination={false}
          />
        </Card>

        <Modal
          title={selectedKnowledgeBase ? '编辑知识库' : '创建知识库'}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={600}
        >
          <KnowledgeBaseForm
            initialValues={selectedKnowledgeBase}
            onSubmit={handleSubmit}
            onCancel={() => setIsModalVisible(false)}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default KnowledgePage; 