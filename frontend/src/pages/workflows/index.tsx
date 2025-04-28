import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, Card, Row, Col, Tag, Tabs, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, ShareAltOutlined, CopyOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { getWorkflows, deleteWorkflow } from '@/utils/api';
import Link from 'next/link';
import styles from '@/styles/Workflows.module.css';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const WorkflowsPage = () => {
  const router = useRouter();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<'create' | 'options' | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const data = await getWorkflows();
      setWorkflows(data);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWorkflow(id);
      fetchWorkflows();
    } catch (error) {
      console.error('Error deleting workflow:', error);
    }
  };

  const handleCreateWorkflow = async () => {
    try {
      const values = await form.validateFields();
      handleModalClose();
      
      // 确保在关闭弹窗后再进行跳转
      setTimeout(() => {
        router.push({
          pathname: '/workflows/design',
          query: values
        });
      }, 0);
    } catch (error) {
      console.error('Error creating workflow:', error);
      message.error('请填写必要的信息');
    }
  };

  const showCreateOptions = () => {
    setModalType('options');
  };

  const showCreateForm = () => {
    setModalType('create');
  };

  const handleModalClose = () => {
    setModalType(null);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <span style={{ color: isActive ? '#52c41a' : '#ff4d4f' }}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="link" onClick={() => router.push(`/workflows/${record.id}/edit`)}>
            Edit
          </Button>
          <Button type="link" onClick={() => router.push(`/workflows/${record.id}/execute`)}>
            Execute
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const templates = [
    {
      id: 1,
      name: '客户服务工作流',
      description: '处理客户请求的标准流程，包括工单分配、处理和回访。',
      tags: ['客服', '工单处理'],
      author: 'BizBrain',
      usageCount: 128
    },
    {
      id: 2,
      name: '销售线索跟进',
      description: '跟踪和管理销售线索，包括初步接触、需求分析和报价流程。',
      tags: ['销售', 'CRM'],
      author: 'BizBrain',
      usageCount: 89
    },
    {
      id: 3,
      name: '项目审批流程',
      description: '标准的项目审批流程，包括提案、评估、预算审核等环节。',
      tags: ['项目管理', '审批'],
      author: 'BizBrain',
      usageCount: 256
    }
  ];

  const myWorkflows = [
    {
      id: 1,
      name: '产品发布流程',
      description: '自定义的产品发布流程，包括测试、文档和发布步骤。',
      tags: ['产品', '发布'],
      shared: true,
      lastModified: '2024-03-20'
    },
    {
      id: 2,
      name: '营销活动审核',
      description: '营销内容的审核和发布流程。',
      tags: ['营销', '审核'],
      shared: false,
      lastModified: '2024-03-19'
    }
  ];

  const renderCard = (item: any, type: 'template' | 'workflow') => (
    <Col span={8} key={item.id}>
      <Card className={styles.card}>
        <Title level={4}>{item.name}</Title>
        <Paragraph className={styles.cardDescription}>
          {item.description}
        </Paragraph>
        <div className={styles.tags}>
          {item.tags.map(tag => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        <div className={styles.cardFooter}>
          {type === 'template' ? (
            <>
              <div className={styles.cardMeta}>
                <span>作者: {item.author}</span>
                <span>{item.usageCount} 次使用</span>
              </div>
              <Button type="primary" icon={<CopyOutlined />}>使用模版</Button>
            </>
          ) : (
            <>
              <div className={styles.cardMeta}>
                <span>修改于: {item.lastModified}</span>
                {item.shared && <Tag color="blue" icon={<ShareAltOutlined />}>已分享</Tag>}
              </div>
              <div className={styles.cardActions}>
                <Button type="link">编辑</Button>
                <Button type="link" icon={<ShareAltOutlined />}>分享</Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </Col>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Title level={2}>工作流模版库</Title>
          <Paragraph className={styles.description}>
            使用预设模版快速开始，或创建自定义工作流并与团队分享。
          </Paragraph>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={showCreateOptions}>
          创建工作流
        </Button>
      </div>

      <Tabs defaultActiveKey="templates" className={styles.tabs}>
        <TabPane tab="推荐模版" key="templates">
          <Row gutter={[24, 24]}>
            {templates.map(template => renderCard(template, 'template'))}
          </Row>
        </TabPane>
        
        <TabPane tab="我的工作流" key="my">
          <Row gutter={[24, 24]}>
            {myWorkflows.map(workflow => renderCard(workflow, 'workflow'))}
            {/* 添加占位卡片以保持宽度一致 */}
            {myWorkflows.length < 3 && Array(3 - myWorkflows.length).fill(null).map((_, index) => (
              <Col span={8} key={`placeholder-${index}`}>
                <div style={{ height: 0 }} />
              </Col>
            ))}
          </Row>
        </TabPane>
      </Tabs>

      {/* 选择创建方式的弹窗 */}
      <Modal
        title="创建工作流"
        open={modalType === 'options'}
        onCancel={handleModalClose}
        footer={null}
      >
        <div className={styles.createOptions}>
          <Card 
            className={styles.createOption} 
            onClick={() => {
              handleModalClose();
              showCreateForm();
            }}
          >
            <PlusOutlined className={styles.createIcon} />
            <Title level={4}>从头创建</Title>
            <Paragraph>创建全新的自定义工作流</Paragraph>
          </Card>
          <Card 
            className={styles.createOption}
            onClick={() => {
              handleModalClose();
              // TODO: 实现模板选择功能
            }}
          >
            <CopyOutlined className={styles.createIcon} />
            <Title level={4}>使用模版</Title>
            <Paragraph>基于现有模版快速创建</Paragraph>
          </Card>
        </div>
      </Modal>

      {/* 创建工作流表单弹窗 */}
      <Modal
        title="创建工作流"
        open={modalType === 'create'}
        onOk={handleCreateWorkflow}
        onCancel={handleModalClose}
        maskClosable={false}
        width={600}
        okText="下一步"
        cancelText="取消"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
        >
          <Form.Item
            label="工作流名称"
            name="name"
            rules={[{ required: true, message: '请输入工作流名称' }]}
          >
            <Input placeholder="请输入工作流名称" />
          </Form.Item>
          <Form.Item
            label="描述"
            name="description"
            rules={[{ required: true, message: '请输入工作流描述' }]}
          >
            <TextArea rows={3} placeholder="请输入工作流描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WorkflowsPage; 