import React from 'react';
import { Typography, Card, Row, Col } from 'antd';
import { BookOutlined, ApiOutlined, ToolOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const DocsPage = () => {
  const sections = [
    {
      icon: <BookOutlined style={{ fontSize: 24 }} />,
      title: '快速入门',
      description: '了解如何快速开始使用 BizBrain，创建您的第一个 AI Agent。',
      link: '/docs/getting-started'
    },
    {
      icon: <ApiOutlined style={{ fontSize: 24 }} />,
      title: 'API 文档',
      description: '详细的 API 接口说明，帮助您集成和使用我们的服务。',
      link: '/docs/api'
    },
    {
      icon: <ToolOutlined style={{ fontSize: 24 }} />,
      title: '工具集成',
      description: '学习如何将 BizBrain 与您现有的工具和工作流程集成。',
      link: '/docs/integration'
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={1}>文档中心</Title>
      <Paragraph>
        欢迎使用 BizBrain 文档中心。在这里您可以找到所有关于如何使用和集成 BizBrain 的详细说明。
      </Paragraph>
      
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        {sections.map((section, index) => (
          <Col xs={24} sm={12} md={8} key={index}>
            <Card
              hoverable
              style={{ height: '100%' }}
              onClick={() => window.location.href = section.link}
            >
              <div style={{ marginBottom: '16px' }}>
                {section.icon}
              </div>
              <Title level={3}>{section.title}</Title>
              <Paragraph>{section.description}</Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default DocsPage; 