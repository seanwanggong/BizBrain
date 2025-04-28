import React, { useState } from 'react';
import { Button, Card, Col, Modal, Row, Tabs, Tag, Typography } from 'antd';
import { PlusOutlined, FileTextOutlined, AppstoreOutlined, StarOutlined } from '@ant-design/icons';
import styles from '@/styles/Knowledge.module.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Mock data for templates
const templates = [
  {
    id: 1,
    name: '客户服务知识库',
    description: '包含常见问题解答、产品使用指南和故障排除步骤的完整知识库模板',
    tags: ['客服', '产品支持', '常见问题'],
    features: ['自动分类', '搜索优化', '多语言支持'],
    usageCount: 2345,
    rating: 4.8,
  },
  {
    id: 2,
    name: '产品文档库',
    description: '适用于产品说明书、API文档和技术规范的专业文档库模板',
    tags: ['产品文档', '技术文档', 'API'],
    features: ['版本控制', '代码高亮', '在线预览'],
    usageCount: 1890,
    rating: 4.7,
  },
  {
    id: 3,
    name: '培训资料库',
    description: '整合企业培训材料、课程内容和学习资源的知识库模板',
    tags: ['培训', '学习', '教育'],
    features: ['课程管理', '进度跟踪', '考核系统'],
    usageCount: 1567,
    rating: 4.6,
  },
];

// Mock data for user knowledge bases
const userKnowledgeBases = [
  {
    id: 1,
    name: '产品使用手册',
    description: '包含所有产品的详细使用说明和常见问题解答',
    tags: ['产品文档', '使用手册'],
    lastUpdated: '2024-03-20',
    documentCount: 156,
  },
  {
    id: 2,
    name: '技术文档中心',
    description: 'API文档、开发指南和技术规范的集中存储库',
    tags: ['技术文档', 'API', '开发'],
    lastUpdated: '2024-03-19',
    documentCount: 89,
  },
];

const KnowledgeBasePage: React.FC = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const renderCard = (item: any, isTemplate: boolean) => (
    <Col xs={24} sm={12} lg={8} key={item.id}>
      <Card className={styles.card}>
        <Title level={4}>{item.name}</Title>
        <Text className={styles.cardDescription}>{item.description}</Text>
        
        <div className={styles.tags}>
          {item.tags.map((tag: string) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>

        {isTemplate ? (
          <>
            <div className={styles.features}>
              <Text className={styles.featuresTitle}>主要功能</Text>
              <ul>
                {item.features.map((feature: string) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
            <div className={styles.cardFooter}>
              <div className={styles.cardMeta}>
                <Text><StarOutlined /> {item.rating} 分</Text>
                <Text>{item.usageCount} 次使用</Text>
              </div>
              <div className={styles.cardActions}>
                <Button type="primary">使用模板</Button>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.cardFooter}>
            <div className={styles.cardMeta}>
              <Text>最后更新：{item.lastUpdated}</Text>
              <Text>{item.documentCount} 个文档</Text>
            </div>
            <div className={styles.cardActions}>
              <Button>查看详情</Button>
              <Button type="primary">编辑</Button>
            </div>
          </div>
        )}
      </Card>
    </Col>
  );

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <Title level={2}>知识库</Title>
            <Text className={styles.description}>
              创建和管理您的知识库，轻松组织和分享团队知识
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            创建知识库
          </Button>
        </div>

        <Tabs className={styles.tabs}>
          <TabPane tab="推荐模板" key="templates">
            <Row gutter={[24, 24]}>
              {templates.map(template => renderCard(template, true))}
            </Row>
          </TabPane>
          <TabPane tab="我的知识库" key="my">
            <Row gutter={[24, 24]}>
              {userKnowledgeBases.map(kb => renderCard(kb, false))}
            </Row>
          </TabPane>
        </Tabs>

        <Modal
          title="创建知识库"
          visible={createModalVisible}
          onCancel={() => setCreateModalVisible(false)}
          footer={null}
          width={600}
        >
          <div className={styles.createOptions}>
            <Card onClick={() => setCreateModalVisible(false)}>
              <FileTextOutlined className={styles.createIcon} />
              <Title level={4}>从零开始</Title>
              <Text>创建一个全新的空白知识库，自定义所有内容和结构</Text>
            </Card>
            <Card onClick={() => setCreateModalVisible(false)}>
              <AppstoreOutlined className={styles.createIcon} />
              <Title level={4}>使用模板</Title>
              <Text>从预设模板中选择，快速开始并根据需求调整</Text>
            </Card>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default KnowledgeBasePage; 