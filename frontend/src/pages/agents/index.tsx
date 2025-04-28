import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, Card, Row, Col, Spin, Tag, Tabs, Modal, message, Tooltip } from 'antd';
import { PlusOutlined, ShareAltOutlined, CopyOutlined, RobotOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { Agent, AGENT_TYPES, MODEL_OPTIONS } from '@/types/agent';
import { getAgents, deleteAgent } from '@/utils/api';
import Link from 'next/link';
import styles from '@/styles/Agents.module.css';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;

const AgentsPage = () => {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalVisible, setIsCreateModalVisible] = React.useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const data = await getAgents();
      setAgents(data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '删除后无法恢复，确定要删除这个Agent吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteAgent(id);
          message.success('删除成功');
          fetchAgents();
        } catch (error) {
          console.error('Failed to delete agent:', error);
          message.error('删除失败');
        }
      },
    });
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const agentType = AGENT_TYPES.find(t => t.value === type);
        return (
          <Tooltip title={agentType?.description}>
            <Tag color="blue">{agentType?.label || type}</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: '模型',
      dataIndex: 'model',
      key: 'model',
      render: (model: string) => {
        const modelOption = MODEL_OPTIONS.find(m => m.value === model);
        return <Tag color="green">{modelOption?.label || model}</Tag>;
      },
    },
    {
      title: '工具',
      dataIndex: 'tools',
      key: 'tools',
      render: (tools: string[]) => (
        <Space size={[0, 8]} wrap>
          {tools.map((tool) => (
            <Tag key={tool}>{tool}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Agent) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => router.push(`/agents/edit/${record.id}`)}
          >
            编辑
          </Button>
          <Button
            type="text"
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

  const templates = [
    {
      id: 1,
      name: '客服助手',
      description: '智能客服 Agent，可以自动回答用户常见问题，处理简单查询和服务请求。',
      tags: ['客服', '自动回复'],
      author: 'BizBrain',
      usageCount: 256,
      abilities: ['问答', '工单处理', '情感分析']
    },
    {
      id: 2,
      name: '数据分析师',
      description: '专注于数据分析的 Agent，可以处理数据清洗、分析和可视化任务。',
      tags: ['数据分析', 'BI'],
      author: 'BizBrain',
      usageCount: 189,
      abilities: ['数据处理', '统计分析', '报表生成']
    },
    {
      id: 3,
      name: '营销助手',
      description: '协助制定和执行营销策略的 Agent，包括内容创作和活动策划。',
      tags: ['营销', '内容创作'],
      author: 'BizBrain',
      usageCount: 145,
      abilities: ['文案生成', '市场分析', '活动策划']
    }
  ];

  const myAgents = [
    {
      id: 1,
      name: '产品文档助手',
      description: '自定义的产品文档助手，可以回答产品相关问题并生成文档。',
      tags: ['文档', '产品'],
      shared: true,
      lastModified: '2024-03-20',
      abilities: ['文档生成', '问答']
    },
    {
      id: 2,
      name: '销售预测助手',
      description: '基于历史数据进行销售预测和分析的智能助手。',
      tags: ['销售', '预测'],
      shared: false,
      lastModified: '2024-03-19',
      abilities: ['数据分析', '预测模型']
    }
  ];

  const renderCard = (item: any, type: 'template' | 'agent') => (
    <Col span={8} key={item.id}>
      <Card className={styles.card}>
        <Title level={4}>{item.name}</Title>
        <Paragraph className={styles.cardDescription}>
          {item.description}
        </Paragraph>
        <div className={styles.tags}>
          {item.tags.map((tag: string) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        <div className={styles.abilities}>
          <div className={styles.abilitiesTitle}>具备能力：</div>
          {item.abilities.map((ability: string) => (
            <Tag key={ability} color="blue">{ability}</Tag>
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
      <div className={styles.content}>
        <div style={{ width: '100%' }}>
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} className={styles.title}>Agent 系统</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/agents/create')}>
              创建 Agent
            </Button>
          </div>

          <Row gutter={[24, 24]}>
            <Col span={8}>
              <Card className={styles.card} title="Agent 管理" bordered={false}>
                <Paragraph>
                  创建和管理您的 AI Agent，配置其角色和能力。
                </Paragraph>
                <Link href="/agents/manage">
                  <Button type="link">查看详情</Button>
                </Link>
              </Card>
            </Col>
            <Col span={8}>
              <Card className={styles.card} title="Agent 模板" bordered={false}>
                <Paragraph>
                  使用预定义的模板快速创建特定用途的 Agent。
                </Paragraph>
                <Link href="/agents/templates">
                  <Button type="link">查看详情</Button>
                </Link>
              </Card>
            </Col>
            <Col span={8}>
              <Card className={styles.card} title="Agent 市场" bordered={false}>
                <Paragraph>
                  探索和部署社区贡献的优质 Agent。
                </Paragraph>
                <Link href="/agents/market">
                  <Button type="link">查看详情</Button>
                </Link>
              </Card>
            </Col>
          </Row>

          <div style={{ marginTop: '24px' }}>
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={agents}
                rowKey="id"
                pagination={false}
                scroll={{ x: true }}
              />
            </Spin>
          </div>
        </div>
      </div>

      <Tabs defaultActiveKey="templates" className={styles.tabs}>
        <TabPane tab="推荐模版" key="templates">
          <Row gutter={[24, 24]}>
            {templates.map(template => renderCard(template, 'template'))}
          </Row>
        </TabPane>
        
        <TabPane tab="我的 Agent" key="my">
          <Row gutter={[24, 24]}>
            {myAgents.map(agent => renderCard(agent, 'agent'))}
            {myAgents.length < 3 && Array(3 - myAgents.length).fill(null).map((_, index) => (
              <Col span={8} key={`placeholder-${index}`}>
                <div style={{ height: 0 }} />
              </Col>
            ))}
          </Row>
        </TabPane>
      </Tabs>

      <Modal
        title="创建 Agent"
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
      >
        <div className={styles.createOptions}>
          <Card className={styles.createOption} onClick={() => setIsCreateModalVisible(false)}>
            <PlusOutlined className={styles.createIcon} />
            <Title level={4}>从头创建</Title>
            <Paragraph>创建全新的自定义 Agent</Paragraph>
          </Card>
          <Card className={styles.createOption} onClick={() => setIsCreateModalVisible(false)}>
            <CopyOutlined className={styles.createIcon} />
            <Title level={4}>使用模版</Title>
            <Paragraph>基于现有模版快速创建</Paragraph>
          </Card>
        </div>
      </Modal>
    </div>
  );
};

export default AgentsPage; 