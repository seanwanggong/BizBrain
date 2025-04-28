import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Card, Button, Space, Table, Tag, Typography, Upload, Input, message } from 'antd';
import { UploadOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { KnowledgeBase, KnowledgeDocument } from '@/types/knowledge';
import DocumentPreview from '@/components/DocumentPreview';
import styles from './[id].module.css';

const { Title } = Typography;
const { Search } = Input;

const KnowledgeBaseDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [searchText, setSearchText] = useState('');
  const [previewDocument, setPreviewDocument] = useState<KnowledgeDocument | null>(null);

  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase>({
    id: id as string,
    name: '产品文档',
    description: '包含所有产品相关的文档和说明',
    createdAt: '2024-03-20',
    updatedAt: '2024-03-20',
    documents: [
      {
        id: '1',
        name: '产品使用指南',
        type: 'markdown',
        content: '# 产品使用指南\n\n## 第一章：入门\n\n...',
        metadata: {},
        createdAt: '2024-03-20',
        updatedAt: '2024-03-20',
      },
      {
        id: '2',
        name: 'API文档',
        type: 'markdown',
        content: '# API文档\n\n## 接口说明\n\n...',
        metadata: {},
        createdAt: '2024-03-19',
        updatedAt: '2024-03-19',
      },
    ],
  });

  const filteredDocuments = useMemo(() => {
    if (!searchText) return knowledgeBase.documents;
    return knowledgeBase.documents.filter(doc => 
      doc.name.toLowerCase().includes(searchText.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [knowledgeBase.documents, searchText]);

  const handleUpload = (file: File) => {
    // 这里应该实现文件上传逻辑
    const newDocument: KnowledgeDocument = {
      id: Date.now().toString(),
      name: file.name,
      type: 'text', // 根据文件类型判断
      content: '', // 需要读取文件内容
      metadata: {
        size: file.size,
        type: file.type,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setKnowledgeBase({
      ...knowledgeBase,
      documents: [...knowledgeBase.documents, newDocument],
    });

    message.success('文档上传成功');
    return false; // 阻止默认上传行为
  };

  const handleDelete = (documentId: string) => {
    setKnowledgeBase({
      ...knowledgeBase,
      documents: knowledgeBase.documents.filter(doc => doc.id !== documentId),
    });
    message.success('文档已删除');
  };

  const columns = [
    {
      title: '文档名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: '上传时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (record: KnowledgeDocument) => (
        <Space size="middle">
          <Button 
            type="link"
            onClick={() => setPreviewDocument(record)}
          >
            预览
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={2}>{knowledgeBase.name}</Title>
        <p className={styles.description}>{knowledgeBase.description}</p>
      </div>

      <Card
        title="文档管理"
        extra={
          <Space>
            <Search
              placeholder="搜索文档"
              allowClear
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Upload
              beforeUpload={handleUpload}
              showUploadList={false}
            >
              <Button type="primary" icon={<UploadOutlined />}>
                上传文档
              </Button>
            </Upload>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredDocuments}
          rowKey="id"
          pagination={false}
        />
      </Card>

      {previewDocument && (
        <DocumentPreview
          document={previewDocument}
          visible={!!previewDocument}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </div>
  );
};

export default KnowledgeBaseDetail; 